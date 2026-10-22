from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from groq import AsyncGroq
import os
import base64
import json

router = APIRouter()

class ConversationRequest(BaseModel):
    word: str
    target_language: str
    native_language: str
    user_message: Optional[str] = None
    conversation_history: Optional[List[dict]] = []

class ConversationResponse(BaseModel):
    success: bool
    ai_message: Optional[str] = None
    scenario: Optional[str] = None
    translation: Optional[str] = None
    error: Optional[str] = None

class ConversationAgent:
    def __init__(self):
        self._client = None
        self.model = "llama-3.3-70b-versatile"

    def _get_client(self):
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key or api_key == "your_groq_api_key_here":
                raise ValueError("GROQ_API_KEY is not set")
            self._client = AsyncGroq(api_key=api_key)
        return self._client

    async def start_conversation(self, word: str, target_lang: str, native_lang: str):
        """Generate an opening message for a conversation about the word"""
        
        prompt = f"""You are a friendly language tutor helping someone learn {target_lang}. 
The user just learned the word/phrase: '{word}'.

Create a realistic, everyday conversation scenario where this word would naturally be used. 
Start the conversation as if you're talking to the user in {target_lang}.

Keep it SHORT (1-2 sentences max). Make it feel natural and conversational.

Respond in this JSON format:
{{
    "scenario": "Brief description of the situation (e.g., 'At a restaurant ordering food')",
    "message": "Your opening line in {target_lang}",
    "translation": "English translation of your message"
}}"""

        try:
            response = await self._get_client().chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful, friendly language tutor. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=512
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            return {
                "scenario": "Practice conversation",
                "message": f"Let's practice using '{word}' in a conversation!",
                "translation": f"Let's practice using '{word}' in a conversation!"
            }

    async def continue_conversation(self, word: str, target_lang: str, native_lang: str, 
                                   user_message: str, history: List[dict]):
        """Continue the conversation based on user's response"""
        
        system_prompt = f"""You are a friendly language tutor helping someone learn {target_lang}. 
The conversation is about the word/phrase: '{word}'.

Rules:
- Respond in {target_lang} (the target language)
- Keep responses SHORT (1-2 sentences)
- Be encouraging and natural
- If the user makes mistakes, gently correct them
- Stay on topic related to '{word}'

Also provide the English translation of your response."""

        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        for msg in history[-6:]:  # Keep last 6 messages for context
            role = "user" if msg.get("is_user") else "assistant"
            content = msg.get("text", "")
            messages.append({"role": role, "content": content})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})

        try:
            response = await self._get_client().chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=512
            )
            
            ai_response = response.choices[0].message.content
            
            # Ask for translation in a separate call for reliability
            trans_prompt = f"Translate this {target_lang} text to English: '{ai_response}'"
            trans_response = await self._get_client().chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": trans_prompt}],
                temperature=0.1,
                max_tokens=256
            )
            
            translation = trans_response.choices[0].message.content
            
            return {
                "message": ai_response,
                "translation": translation
            }
        except Exception as e:
            return {
                "message": "That's great! Keep practicing.",
                "translation": "That's great! Keep practicing."
            }

conversation_agent = ConversationAgent()

@router.post("/start", response_model=ConversationResponse)
async def start_conversation(request: ConversationRequest):
    try:
        result = await conversation_agent.start_conversation(
            request.word,
            request.target_language,
            request.native_language
        )
        
        return ConversationResponse(
            success=True,
            ai_message=result.get("message"),
            scenario=result.get("scenario"),
            translation=result.get("translation")
        )
    except Exception as e:
        return ConversationResponse(success=False, error=str(e))

@router.post("/continue", response_model=ConversationResponse)
async def continue_conversation(request: ConversationRequest):
    try:
        result = await conversation_agent.continue_conversation(
            request.word,
            request.target_language,
            request.native_language,
            request.user_message or "",
            request.conversation_history or []
        )
        
        return ConversationResponse(
            success=True,
            ai_message=result.get("message"),
            translation=result.get("translation")
        )
    except Exception as e:
        return ConversationResponse(success=False, error=str(e))

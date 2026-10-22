from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from datetime import datetime
from app.models import LearningRequest, LessonResponse, VocabularyItem, QuizRequest
from app.agents.language_agent import LanguageAgent
from app.agents.image_agent import ImageAgent
import uuid
import urllib.parse

router = APIRouter()
language_agent = LanguageAgent()
image_agent = ImageAgent()

learning_sessions = {}

@router.post("/learn", response_model=LessonResponse)
async def learn_word(request: LearningRequest):
    try:
        result = await language_agent.translate_and_explain(
            request.native_language,
            request.target_language,
            request.word_or_phrase,
            request.include_examples
        )

        image_urls = []
        if request.include_image:
            image_urls = await image_agent.get_image_urls(
                request.word_or_phrase,
                request.target_language
            )
            # If all external providers failed, we don't add a fake image
            # The frontend will handle empty image_urls gracefully

        vocabulary_item = VocabularyItem(
            word=request.word_or_phrase,
            translation=result.get("translation") or "",
            example_sentence=(result.get("examples") or [{}])[0].get("sentence") or "" if result.get("examples") else "",
            example_translation=(result.get("examples") or [{}])[0].get("translation") or "" if result.get("examples") else "",
            image_url=image_urls[0] if image_urls else None,
            image_urls=image_urls if image_urls else None,
            pronunciation_guide=result.get("pronunciation") or ""
        )

        session_id = str(uuid.uuid4())
        learning_sessions[session_id] = {
            "word": vocabulary_item,
            "timestamp": datetime.now()
        }

        return LessonResponse(success=True, data=vocabulary_item)

    except Exception as e:
        return LessonResponse(success=False, data=None, error=str(e))

@router.post("/quiz/generate")
async def generate_quiz(request: QuizRequest):
    try:
        quiz = await language_agent.generate_quiz(
            request.native_language,
            request.target_language,
            request.vocabulary
        )
        return {"success": True, "quiz": quiz}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/visual-card/{word}")
async def visual_card(word: str):
    """Generate a styled SVG visual card as a reliable fallback"""
    safe_word = urllib.parse.unquote(word)
    # Escape special XML characters
    safe_word = safe_word.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad)" rx="20" />
        <circle cx="200" cy="120" r="60" fill="rgba(255,255,255,0.15)" />
        <text x="200" y="210" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">{safe_word}</text>
        <text x="200" y="250" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">Visual Learning Card</text>
        <text x="200" y="320" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle">🎨 AI-Powered Language Learning</text>
    </svg>'''
    
    return Response(content=svg, media_type="image/svg+xml")

import os
from typing import Dict, Any, Optional
from groq import AsyncGroq

class LanguageAgent:
    def __init__(self):
        self._client: Optional[AsyncGroq] = None
        self.model = "llama-3.3-70b-versatile"

    def _get_client(self) -> AsyncGroq:
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key or api_key == "your_groq_api_key_here":
                raise ValueError("GROQ_API_KEY is not set. Please set it in your .env file.")
            self._client = AsyncGroq(api_key=api_key)
        return self._client

    async def translate_and_explain(self, native_lang: str, target_lang: str,
                                   word: str, include_examples: bool = True) -> Dict[str, Any]:
        system_prompt = "You are a helpful language learning assistant. Always respond with valid JSON only."

        user_prompt = f"""Help the user learn the word/phrase '{word}' from {native_lang} to {target_lang}.

Provide the response in this exact JSON format:
{{
    "translation": "the translation in {target_lang}",
    "pronunciation": "simple phonetic pronunciation guide",
    "examples": [
        {{
            "sentence": "an example sentence in {target_lang}",
            "translation": "translation of that sentence in {native_lang}"
        }}
    ],
    "grammatical_notes": "brief grammar or usage notes"
}}"""

        if not include_examples:
            user_prompt = user_prompt.replace(
                '"examples": [\n        {\n            "sentence": "an example sentence in {target_lang}",\n            "translation": "translation of that sentence in {native_lang}"\n        }\n    ]',
                '"examples": []'
            )

        try:
            response = await self._get_client().chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1024
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result
        except Exception:
            return {
                "translation": "Unable to translate",
                "pronunciation": "N/A",
                "examples": [],
                "grammatical_notes": "Please try again"
            }

    async def generate_quiz(self, native_lang: str, target_lang: str,
                           vocabulary: list) -> Dict[str, Any]:
        system_prompt = "You are a helpful language learning assistant. Always respond with valid JSON only."

        vocab_list = ", ".join(vocabulary)
        user_prompt = f"""Create a multiple choice quiz for learning {target_lang} from {native_lang}.
Vocabulary to test: {vocab_list}

Return JSON in this exact format:
{{
    "questions": [
        {{
            "question": "the question text",
            "options": ["option1", "option2", "option3", "option4"],
            "correct": 0,
            "explanation": "why this answer is correct"
        }}
    ]
}}

Generate exactly 3 questions. Make sure exactly one option is correct."""

        try:
            response = await self._get_client().chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.5,
                max_tokens=1024
            )

            import json
            return json.loads(response.choices[0].message.content)
        except Exception:
            return {"questions": []}

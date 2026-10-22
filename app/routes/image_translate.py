from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from groq import AsyncGroq
import os
import base64
import json

router = APIRouter()

class ImageTranslationResponse(BaseModel):
    success: bool
    objects: Optional[List[dict]] = None
    description: Optional[str] = None
    error: Optional[str] = None

class ImageTranslationAgent:
    def __init__(self):
        self._client = None
        self.vision_model = "llama-3.2-11b-vision-preview"

    def _get_client(self):
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key or api_key == "your_groq_api_key_here":
                raise ValueError("GROQ_API_KEY is not set")
            self._client = AsyncGroq(api_key=api_key)
        return self._client

    async def translate_image(self, image_data: str, target_lang: str, native_lang: str):
        """Identify objects in image and translate them"""
        
        prompt = f"""Look at this image and identify the main objects you see. 

For each object, provide:
1. The object name in English
2. The translation in {target_lang}
3. A brief description of what it is

Respond ONLY in this JSON format:
{{
    "description": "A brief overall description of what's in the image",
    "objects": [
        {{
            "name": "object name in English",
            "translation": "translation in {target_lang}",
            "description": "brief description"
        }}
    ]
}}

Identify up to 5 main objects. Be specific and accurate."""

        try:
            response = await self._get_client().chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1024
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
        except Exception as e:
            return {
                "description": "Unable to analyze image",
                "objects": []
            }

image_agent = ImageTranslationAgent()

@router.post("/translate", response_model=ImageTranslationResponse)
async def translate_image(
    target_language: str = "Spanish",
    native_language: str = "English",
    file: UploadFile = File(...)
):
    try:
        # Read image file
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        
        result = await image_agent.translate_image(
            image_base64,
            target_language,
            native_language
        )
        
        return ImageTranslationResponse(
            success=True,
            objects=result.get("objects", []),
            description=result.get("description", "")
        )
    except Exception as e:
        return ImageTranslationResponse(success=False, error=str(e))

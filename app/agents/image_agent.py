import os
import base64
import urllib.parse
import random
import httpx
from typing import Optional, List
from groq import AsyncGroq

class ImageProvider:
    async def get_image_url(self, word: str, language: str) -> Optional[str]:
        raise NotImplementedError

class WikimediaProvider(ImageProvider):
    """Search Wikimedia Commons for actual photos of the word"""
    async def get_image_url(self, word: str, language: str) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Search Wikimedia Commons for images
                search_url = "https://commons.wikimedia.org/w/api.php"
                params = {
                    "action": "query",
                    "list": "search",
                    "srsearch": word,
                    "srnamespace": 6,  # File namespace
                    "format": "json",
                    "srlimit": 5,
                    "origin": "*"
                }
                resp = await client.get(search_url, params=params)
                data = resp.json()
                
                results = data.get("query", {}).get("search", [])
                if not results:
                    return None
                
                # Try each result until we find a valid image
                for result in results:
                    title = result.get("title", "")
                    if not title.startswith("File:"):
                        continue
                    
                    filename = title.replace("File:", "")
                    # Get image info
                    info_params = {
                        "action": "query",
                        "titles": title,
                        "prop": "imageinfo",
                        "iiprop": "url",
                        "format": "json",
                        "origin": "*"
                    }
                    info_resp = await client.get(search_url, params=info_params)
                    info_data = info_resp.json()
                    
                    pages = info_data.get("query", {}).get("pages", {})
                    for page in pages.values():
                        imageinfo = page.get("imageinfo", [])
                        if imageinfo:
                            return imageinfo[0].get("url")
                
                return None
        except Exception:
            return None

class WikipediaProvider(ImageProvider):
    """Use Wikipedia page summary which often includes an image"""
    async def get_image_url(self, word: str, language: str) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Try to get summary which includes thumbnail
                url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(word)}"
                resp = await client.get(url, headers={"User-Agent": "LanguageLearningApp/1.0"})
                if resp.status_code == 200:
                    data = resp.json()
                    thumbnail = data.get("thumbnail", {})
                    if thumbnail and thumbnail.get("source"):
                        # Just use the thumbnail URL directly - it works fine
                        return thumbnail["source"]
                return None
        except Exception:
            return None

class PollinationsProvider(ImageProvider):
    """AI-generated images - free but rate limited"""
    def __init__(self):
        self.base_url = "https://image.pollinations.ai/prompt"

    async def get_image_url(self, word: str, language: str) -> Optional[str]:
        words = word.split()
        short_word = " ".join(words[:4]) if len(words) > 4 else word
        prompt_text = f"Simple clear illustration of {short_word}, educational, clean background, no text, flat design style"
        encoded_prompt = urllib.parse.quote(prompt_text)
        seed = random.randint(1, 999999)
        return f"{self.base_url}/{encoded_prompt}?width=400&height=400&nologo=true&seed={seed}"

class PicsumProvider(ImageProvider):
    """Random photos from Picsum - always works but not word-specific"""
    async def get_image_url(self, word: str, language: str) -> Optional[str]:
        seed = hash(word) % 10000
        return f"https://picsum.photos/seed/{seed}/400/400"

class ImageAgent:
    def __init__(self):
        self._client: Optional[AsyncGroq] = None
        self.vision_model = "llama-3.2-11b-vision-preview"
        self.providers: List[ImageProvider] = [
            WikipediaProvider(),      # Best: actual relevant images
            WikimediaProvider(),      # Good: Wikimedia Commons photos
            PollinationsProvider(),   # AI-generated fallback
            PicsumProvider(),         # Last resort: random photo
        ]

    def _get_client(self) -> AsyncGroq:
        if self._client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key or api_key == "your_groq_api_key_here":
                raise ValueError("GROQ_API_KEY is not set. Please set it in your .env file.")
            self._client = AsyncGroq(api_key=api_key)
        return self._client

    async def get_image_urls(self, word: str, language: str) -> List[str]:
        """Return multiple image URLs from different providers"""
        urls = []
        for provider in self.providers:
            try:
                url = await provider.get_image_url(word, language)
                if url:
                    urls.append(url)
            except Exception:
                continue
        return urls

    async def get_image_prompt(self, word: str, language: str) -> str:
        """Primary image URL (for backwards compatibility)"""
        urls = await self.get_image_urls(word, language)
        return urls[0] if urls else ""

    async def generate_image_description(self, word: str, language: str) -> str:
        prompt = f"Describe a simple, clear image that represents the word '{word}' in {language}. Keep it concise (2-3 sentences), suitable for educational purposes."

        try:
            response = await self._get_client().chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=256
            )
            return response.choices[0].message.content
        except Exception:
            return f"A simple illustration representing '{word}' for language learning."

    async def analyze_image(self, image_data: str, expected_word: str) -> dict:
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        try:
            response = await self._get_client().chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"Does this image represent the word '{expected_word}'? Answer with JSON: {{\"matches\": true/false, \"confidence\": 0-100, \"explanation\": \"brief explanation\"}}"
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
                max_tokens=256
            )

            import json
            return json.loads(response.choices[0].message.content)
        except Exception:
            return {"matches": False, "confidence": 0, "explanation": "Image analysis failed. Please try again."}

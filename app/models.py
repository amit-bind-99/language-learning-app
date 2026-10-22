from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class Language(str, Enum):
    ENGLISH = "en"
    SPANISH = "es"
    FRENCH = "fr"
    GERMAN = "de"
    ITALIAN = "it"
    JAPANESE = "ja"
    CHINESE = "zh"
    KOREAN = "ko"

class LearningRequest(BaseModel):
    native_language: str
    target_language: str
    word_or_phrase: str
    include_examples: bool = True
    include_image: bool = False

class VocabularyItem(BaseModel):
    word: str
    translation: str
    example_sentence: Optional[str]
    example_translation: Optional[str]
    image_url: Optional[str]
    image_urls: Optional[List[str]] = None
    pronunciation_guide: Optional[str]

class QuizRequest(BaseModel):
    vocabulary: List[str]
    native_language: str = "English"
    target_language: str = "Spanish"

class ConversationMessage(BaseModel):
    text: str
    is_user: bool
    translation: Optional[str] = None

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

class ImageObject(BaseModel):
    name: str
    translation: str
    description: Optional[str] = None

class ImageTranslationResponse(BaseModel):
    success: bool
    objects: Optional[List[ImageObject]] = None
    description: Optional[str] = None
    error: Optional[str] = None

class LessonResponse(BaseModel):
    success: bool
    data: Optional[VocabularyItem] = None
    error: Optional[str] = None
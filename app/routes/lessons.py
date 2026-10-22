from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel

router = APIRouter()

class Lesson(BaseModel):
    id: str
    title: str
    words: List[str]
    difficulty: str

# Sample lessons data
LESSONS = {
    "basics": [
        Lesson(id="lesson1", title="Greetings", words=["hello", "goodbye", "thank you"], difficulty="beginner"),
        Lesson(id="lesson2", title="Numbers 1-10", words=["one", "two", "three", "four", "five"], difficulty="beginner"),
        Lesson(id="lesson3", title="Colors", words=["red", "blue", "green", "yellow", "black"], difficulty="beginner"),
    ],
    "intermediate": [
        Lesson(id="lesson4", title="Food & Drinks", words=["apple", "water", "bread", "coffee"], difficulty="intermediate"),
        Lesson(id="lesson5", title="Family Members", words=["mother", "father", "brother", "sister"], difficulty="intermediate"),
    ]
}

@router.get("/")
async def get_lessons():
    return {"success": True, "lessons": LESSONS}

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    for category in LESSONS.values():
        for lesson in category:
            if lesson.id == lesson_id:
                return {"success": True, "lesson": lesson}
    raise HTTPException(status_code=404, detail="Lesson not found")

@router.post("/custom")
async def create_custom_lesson(words: List[str], difficulty: str):
    lesson = Lesson(
        id=f"custom_{len(words)}",
        title="Custom Lesson",
        words=words,
        difficulty=difficulty
    )
    return {"success": True, "lesson": lesson}
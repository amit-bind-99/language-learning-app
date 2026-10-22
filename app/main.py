from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pathlib import Path
from dotenv import load_dotenv
import os

from app.routes import lessons, learning, conversation, image_translate

load_dotenv()

app = FastAPI(title="Language Learning Assistant")

# Setup templates and static files
templates_dir = Path(__file__).parent / "templates"
static_dir = Path(__file__).parent / "static"
templates = Jinja2Templates(directory=templates_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])
app.include_router(conversation.router, prefix="/api/conversation", tags=["conversation"])
app.include_router(image_translate.router, prefix="/api/image", tags=["image"])

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
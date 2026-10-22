# 🌍 PolyglotAI - AI-Powered Language Learning

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a393.svg)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-LLM-f54100.svg)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Learn any language naturally through AI conversation, visual recognition, and voice interaction — all for free.**

## 🎬 Demo

![Demo GIF Placeholder](docs/demo.gif)

**[🚀 Live Demo](https://your-demo-link.com)** | **[📹 Video Walkthrough](https://your-video-link.com)**

---

## ✨ What Makes It Special

Traditional language apps teach you vocabulary in isolation. **PolyglotAI** creates an immersive learning experience by combining:

| Feature | Why It Matters |
|---------|---------------|
| 🎤 **Voice Input & Output** | Speak naturally, hear native pronunciation |
| 🖼️ **Image Translation** | Point your camera at objects to learn their names |
| 💬 **AI Conversation Simulator** | Practice real conversations about words you just learned |
| 🎯 **Pronunciation Scoring** | Get instant feedback on your accent |
| 🧠 **Groq-Powered Intelligence** | Sub-second AI responses, completely free |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Voice   │  │  Camera  │  │   Chat Interface     │  │
│  │  Input   │  │  Upload  │  │                      │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
└───────┼─────────────┼───────────────────┼──────────────┘
        │             │                   │
        ▼             ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Language    │  │  Conversation│  │    Image     │  │
│  │   Agent      │  │    Agent     │  │    Agent     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                    Free AI APIs                          │
│  ┌────────────────────┐  ┌──────────────────────────┐  │
│  │   Groq (LLM)       │  │  Pollinations (Images)   │  │
│  │   • Translation    │  │  • Wikipedia (Photos)    │  │
│  │   • Quiz Gen       │  │  • AI Generation         │  │
│  │   • Conversation   │  │                          │  │
│  └────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- A free [Groq API key](https://console.groq.com) (takes 30 seconds)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/polyglotai.git
cd polyglotai

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run the app
uvicorn app.main:app --reload
```

Open http://localhost:8000 and start learning! 🎉

---

## 🌐 Deploy for Free (2 Minutes)

### Option 1: Render (Recommended)

**[Render](https://render.com)** offers a generous free tier with no credit card required.

**One-Click Deploy:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Or manually:**

1. Fork this repo to your GitHub
2. Go to [render.com](https://render.com) → "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in:
   - **Name:** `polyglotai`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn -w 2 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`
5. Add environment variable:
   - `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
6. Click **Deploy**

Your app will be live at `https://polyglotai.onrender.com` in ~2 minutes!

### Option 2: Railway

1. Fork this repo
2. Go to [railway.app](https://railway.app) → "New Project" → "Deploy from GitHub repo"
3. Add `GROQ_API_KEY` in Variables
4. Deploy!

### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
fly launch --name polyglotai

# Set secret
fly secrets set GROQ_API_KEY=your_key_here
```

---

## 🎯 Features in Detail

### 1. Smart Translation with Context
- Translate any word/phrase with AI-generated examples
- Pronunciation guides in IPA
- Visual learning with real photos and AI-generated images

### 2. Voice-First Interaction
- **🎤 Speech-to-Text**: Click mic and speak — no typing needed
- **🔊 Text-to-Speech**: Hear native pronunciation in the target language accent
- **🎯 Pronunciation Check**: Record yourself and get a similarity score

### 3. AI Conversation Simulator
After learning a word, the AI creates a realistic scenario (restaurant, airport, etc.) and starts a conversation in the target language. You respond, and the AI adapts — just like talking to a native speaker.

### 4. Image-to-Vocabulary
Upload any photo and the AI identifies objects, translates them, and describes them. Perfect for learning while traveling!

### 5. Adaptive Quiz Generation
Based on your learning history, the AI generates personalized multiple-choice quizzes to reinforce memory.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS, CSS3, Web Speech API |
| **Backend** | FastAPI, Pydantic |
| **AI/ML** | Groq (Llama 3.3 70B, Llama 3.2 Vision) |
| **Images** | Pollinations.ai, Wikipedia API, Unsplash |
| **Design** | Glassmorphism, CSS Grid, CSS Variables |

---

## 📊 Performance

- **Translation Speed**: ~500ms (Groq)
- **Image Analysis**: ~1.2s (Groq Vision)
- **Conversation Response**: ~800ms
- **Zero Cost**: Uses free tiers only

---

## 🎓 Use Cases

- **Travelers**: Point camera at objects to learn local vocabulary
- **Students**: Practice pronunciation with instant feedback
- **Professionals**: Learn business vocabulary through conversation
- **Casual Learners**: Learn 1 word a day with context and quizzes

---

## 🔮 Future Roadmap

- [ ] Spaced Repetition System (Anki integration)
- [ ] Mobile app (React Native / PWA)
- [ ] Multiplayer quiz battles
- [ ] Handwriting recognition (for CJK languages)
- [ ] Progress dashboard & streak tracking

---

## 👥 Team

- **[Your Name](https://github.com/yourusername)** - Developer & Designer
- Built at [Hackathon Name] 2024

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Made with ❤️ and Groq</b><br>
  <i>Because language learning should be free, fast, and fun.</i>
</p>

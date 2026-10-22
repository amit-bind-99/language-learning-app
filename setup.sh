#!/bin/bash

# PolyglotAI - Hackathon Setup Script
# This script sets up the project in under 60 seconds

set -e

echo "🌍 Setting up PolyglotAI..."
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 || python --version 2>&1)
echo "✓ Python detected: $python_version"

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt > /dev/null 2>&1
echo "✓ Dependencies installed"

# Setup environment file
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "📝 IMPORTANT: Edit .env and add your GROQ_API_KEY"
    echo "   Get one free at: https://console.groq.com"
    echo ""
else
    echo "✓ .env file already exists"
fi

# Check if GROQ_API_KEY is set
if grep -q "your_groq_api_key_here" .env; then
    echo "⚠️  Warning: GROQ_API_KEY not configured"
    echo "   Please edit .env and add your API key"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the app:"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Then open: http://localhost:8000"
echo ""

#!/bin/bash

# Quick start script for testing AssemblyAI integration
echo "🚀 Starting HireFlows with AssemblyAI Integration"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  Creating .env file from template..."
  cp .env.example .env
  echo "✅ Please update .env file with your API keys:"
  echo "   - NEXT_PUBLIC_ASSEMBLYAI_API_KEY (get from https://www.assemblyai.com/app)"
  echo "   - Other required keys as per .env.example"
  echo ""
fi

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Start development server
echo "🔥 Starting development server..."
npm run dev

echo ""
echo "🎉 Ready! Open http://localhost:3000 in your browser"
echo ""
echo "📋 To test AssemblyAI integration:"
echo "   1. Create a webinar"
echo "   2. Join the webinar"
echo "   3. Click the 'Transcript' button in the webinar header"
echo "   4. Click 'Start Recording' and grant microphone access"
echo "   5. Speak and watch real-time transcription appear!"
echo ""
echo "📖 See ASSEMBLYAI_INTEGRATION.md for detailed setup guide"

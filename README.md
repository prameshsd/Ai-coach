# 🧠 AI Concept Coach

Stepwise Socratic tutoring app. Answer hints, get evaluated, track mastery.

## ✨ Features
- Subject bubbles with auto-detection ("Other" mode)
- Subject mismatch detection — warns if your question doesn't match selected subject
- Per-hint answer input with AI evaluation + retry on incorrect
- Hindi / English language toggle (full Devanagari output)
- 🌙 Light & Dark mode
- Concept mastery tracker with confidence calibration

## 🔑 API Setup
Uses **Groq API**.

1. Get your API key: https://console.groq.com/
2. Copy `.env.local.example` → `.env.local`
3. Add your key: `Groq_KEY=sk-ant-...`

## 🚀 Run Locally
```bash
unzip concept-coach.zip && cd concept-coach
npm install
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY
npm run dev
# Open http://localhost:3000
```

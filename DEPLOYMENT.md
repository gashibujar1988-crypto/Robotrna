# Robotrna - Deployment Guide

## Overview
AI-driven multi-agent system med High Council arkitektur. Full stack med React frontend och Python FastAPI backend.

---

## 🔑 API Keys Setup

**VIKTIGT**: API-nycklar finns i separat dokument. Kontakta projekt-ägaren för:
- Google Gemini API Key
- OpenAI API Key
- (Optional) LinkedIn OAuth credentials
- (Optional) Gmail OAuth credentials

---

## 🚀 Quick Start (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/gashibujar1988-crypto/Robotrna.git
cd Robotrna
```

### 2. Setup Frontend
```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add your API keys:
# VITE_GOOGLE_API_KEY=your_gemini_key_here
# VITE_OPENAI_API_KEY=your_openai_key_here
# VITE_BACKEND_URL=http://localhost:8000

# Install and run
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd backend_python

# Create python_secrets.env from example
cp python_secrets.env.example python_secrets.env

# Edit python_secrets.env and add your API keys:
# GOOGLE_API_KEY=your_gemini_key_here
# OPENAI_API_KEY=your_openai_key_here

# Install and run
pip3 install -r requirements.txt
python3 main.py
```

**Open**: http://localhost:5173

---

## ☁️ Production Deployment

### Option 1: Firebase Hosting + Google Cloud Run

#### Deploy Frontend to Firebase
```bash
# Update .env with production backend URL
VITE_BACKEND_URL=https://robotrna-backend-xxx.run.app

# Build and deploy
npm run build
npx firebase deploy --only hosting
```

#### Deploy Backend to Cloud Run
```bash
cd backend_python

# Deploy (add your API keys as env vars)
gcloud run deploy robotrna-backend \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=YOUR_KEY,OPENAI_API_KEY=YOUR_KEY
```

---

### Option 2: Firebase Hosting + Oracle Cloud

#### Deploy Frontend to Firebase
Same as above.

#### Deploy Backend to Oracle Cloud
```bash
cd backend_python

# Build Docker container
docker build -t robotrna-backend .

# Push to Oracle Container Registry
docker tag robotrna-backend:latest iad.ocir.io/YOUR_TENANCY/robotrna-backend:latest
docker push iad.ocir.io/YOUR_TENANCY/robotrna-backend:latest

# Deploy to Oracle Cloud Compute
# SSH into instance and run:
docker pull iad.ocir.io/YOUR_TENANCY/robotrna-backend:latest
docker run -d -p 8000:8000 \
  -e GOOGLE_API_KEY=YOUR_KEY \
  -e OPENAI_API_KEY=YOUR_KEY \
  robotrna-backend:latest
```

---

## 🧪 System Features

### AI Agents (9 Total)
- **Mother** - Hive Mind Orchestrator
- **Soshie** - Social Media Manager (LinkedIn integration)
- **Dexter** - Email Outreach Specialist (Gmail integration)
- **Hunter** - Lead Generation Expert
- **Brainy** - Research Analyst
- **Nova** - Customer Success Manager
- **Pixel** - Creative Director
- **Venture** - Business Strategist
- **Atlas** - Technology Lead
- **Ledger** - Finance Expert

### High Council
5-step AI decision process:
1. Architect (Gemini)
2. Researcher (GPT-4)
3. Critic (GPT-4)
4. Synthesizer (Gemini)
5. DualBrain (Model switching)

### Real-time Features
- WebSocket live logging
- Agent status monitoring
- Task orchestration
- Memory bank system

---

## 📝 Optional: OAuth Setup

### LinkedIn Posts (Real)
See: `backend_python/STARTUP_GUIDE.md` section on LinkedIn OAuth

### Gmail Sending (Real)
See: `backend_python/STARTUP_GUIDE.md` section on Gmail OAuth

**Note**: Without OAuth tokens, system runs in simulation mode (shows what would be posted/sent but doesn't actually post/send).

---

## 🔧 Tech Stack

**Frontend**:
- React 19
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Firebase (Auth, Firestore)

**Backend**:
- Python 3.9+
- FastAPI
- Uvicorn
- Google Gemini API
- OpenAI GPT-4 API
- WebSockets

---

## 📞 Support

Systemet fungerar fullt ut med bara Google + OpenAI nycklar.
LinkedIn/Gmail OAuth är optional för riktiga posts/emails.

**Live URL**: https://robotrna-demo-gashi.firebaseapp.com (after deployment)

---

## 🔐 Getting API Keys

Kontakta projekt-ägaren för att få:
1. Google Gemini API key
2. OpenAI API key
3. (Optional) LinkedIn OAuth credentials
4. (Optional) Gmail OAuth credentials

Eller skaffa egna på:
- **Gemini**: https://ai.google.dev/
- **OpenAI**: https://platform.openai.com/api-keys

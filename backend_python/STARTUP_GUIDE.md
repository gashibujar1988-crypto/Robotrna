# Robotrna Python Backend - Startup Guide

##Quick Start

### 1. Install Dependencies
```bash
cd /Users/sebastiantadait/Desktop/Robotrna/backend_python
pip install -r requirements.txt
```

### 2. Add API Keys
Edit `python_secrets.env` and add:
```bash
# Minimum required for basic functionality
GOOGLE_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Optional (för LinkedIn/Email)
# LINKEDIN_ACCESS_TOKEN=...
# GMAIL_REFRESH_TOKEN=...
```

### 3. Start Backend
```bash
cd backend_python
python main.py
```

You should see:
```
Mother Brain 2.0 (High Council) Initialized. Dual-Brain System Active.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Start Frontend
```bash
# New terminal
cd /Users/sebastiantadait/Desktop/Robotrna
npm run dev
```

Open http://localhost:5173

---

## What Works NOW (Without OAuth)

✅ **All AI Agents** - Mother, Soshie, Dexter, Hunter, etc.
✅ **High Council** - 5-step thinking process
✅ **WebSocket LiveLog** - See agent activity in real-time
✅ **Conversations** - Chat with any agent
✅ **Search Tools** - Google search integration

⚠️ **In Simulation Mode**:
- 📱 LinkedIn posts (shows what would be posted)
- 📧 Email sending (creates drafts, shows what would be sent)

---

## Adding Real LinkedIn/Email (Optional)

### For LinkedIn Posting

1. **Create LinkedIn App**
   - Go to https://www.linkedin.com/developers/apps
   - Click "Create app"
   - Fill in details (name, company page)
   - Under "Products" → Request "Share on LinkedIn" and "Sign In with LinkedIn"

2. **Get OAuth Token**
   ```bash
   # We need to build an OAuth flow - simplified version:
   # 1. Redirect user to LinkedIn OAuth
   # 2. Get authorization code
   # 3. Exchange for access token
   ```

3. **Add to .env**
   ```
   LINKEDIN_ACCESS_TOKEN=your_access_token
   LINKEDIN_AUTHOR_URN=urn:li:person:YOUR_ID
   ```

### For Gmail Sending

1. **Google Cloud Setup**
   - Go to https://console.cloud.google.com/
   - Create project → Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download JSON file

2. **Get Refresh Token**
   - Run OAuth flow to get refresh token
   - (Requires building a small OAuth helper script)

3. **Add to .env**
   ```
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   ```

---

## Testing

### Test Backend Health
```bash
curl http://localhost:8000/
# Expected: {"status": "Mother AI System Online", ...}
```

### Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "agent_name": "Mother"}'
```

### Test LinkedIn (Simulation)
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Post about AI on LinkedIn", "agent_name": "Soshie"}'
```

---

## Troubleshooting

### "Module not found" Error
```bash
pip install -r requirements.txt --upgrade
```

### Port 8000 Already in Use
```bash
# Find process
lsof -i :8000
# Kill it
kill -9 <PID>
```

### WebSocket Won't Connect
- Check backend is running on port 8000
- Check console for CORS errors
- Restart both backend and frontend

### "No API Key" Error
- Verify `python_secrets.env` has GOOGLE_API_KEY and OPENAI_API_KEY
- Check no extra quotes around keys
- Restart backend after adding keys

---

## File Structure

```
backend_python/
├── main.py                 # FastAPI server entry point
├── mother_brain.py         # Main orchestration logic
├── python_secrets.env      # API keys (DO NOT COMMIT)
├── requirements.txt        # Python dependencies
├── agents/
│   └── agent_registry.py   # All 9 agent definitions
├── core/
│   ├── high_council.py     # 5-brain decision system
│   ├── status_broadcaster.py # WebSocket broadcasting
│   └── tool_registry.py    # Tool execution mapping
└── tools/
    ├── email_tool.py       # Gmail integration ✨NEW
    ├── social_tool.py      # LinkedIn integration ✨UPDATED
    └── search_tool.py      # Google search
```

---

## Next Steps

Once everything works locally:

1. **Get API Keys** (if you haven't)
   - Gemini: https://ai.google.dev/
   - OpenAI: https://platform.openai.com/api-keys

2. **Test All Agents** in the UI
  
3. **Optional**: Setup LinkedIn/Gmail OAuth for real posting

4. **Deploy to Production**:
   ```bash
   # Deploy backend to Cloud Run
   gcloud run deploy robotrna-backend \
     --source ./backend_python \
     --region europe-west1 \
     --allow-unauthenticated
   
   # Update frontend .env.production with Cloud Run URL
   # Deploy frontend to Firebase
   npm run build
   firebase deploy --only hosting
   ```

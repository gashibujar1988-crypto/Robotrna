const fs = require('fs');
const content = `DATABASE_URL="file:./dev.db"
JWT_SECRET="robotrna-secret-key-change-me"
PORT=5000

# Google Integration
GOOGLE_CLIENT_ID="979639267118-27klb22qi2ps05dib2kikmirmau3gh70.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
GOOGLE_REDIRECT_URI="http://localhost:5173/auth/google/callback"

# Gemini AI
GEMINI_API_KEY="AIzaSyBVJNWvIwYi2ZYPyZMo16K16n33R2XTV9U"
`;

fs.writeFileSync('backend/.env', content);
console.log('Fixed .env');

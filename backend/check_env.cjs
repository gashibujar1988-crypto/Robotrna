require('dotenv').config();
console.log('CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('PORT:', process.env.PORT || 3000);

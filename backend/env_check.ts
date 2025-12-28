import dotenv from 'dotenv';
dotenv.config();
console.log('ENV CHECK:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 7) : 'NOT FOUND');

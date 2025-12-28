import fetch from 'node-fetch';

async function register() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'demo@robotrna.com',
                password: 'password123',
                name: 'Demo User'
            })
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

register();

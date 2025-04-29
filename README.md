# 🍽️ Food Ordering Admin System – Full Deployment Guide

## 🔧 Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Git
- WhatsApp API Provider (e.g., Twilio)
- SMTP Email Provider (e.g., Gmail, SendGrid)
- Cloud Hosting / VPS (e.g., Render, Vercel, Netlify)
- Docker & Docker Compose  
  👉 [Install Docker](https://docs.docker.com/get-docker/)

---

## 🚀 Setup & Deployment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>

2.Install Backend Dependencies

cd backend
npm install


3.Configure Backend .env

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_KEY=your_whatsapp_api_key
BASE_CLIENT_URL=http://localhost:3000


4. Run Backend Locally

npm start


5. Install Frontend Dependencies

cd ../frontend
npm install


6. Run Frontend Locally

npm run dev

==========================================================================================

Docker Deployment

1. Run All Services with Docker
![Picture1](https://github.com/user-attachments/assets/6d036604-e88b-44f8-8946-4c04e0a6c732)


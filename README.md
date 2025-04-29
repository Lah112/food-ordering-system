
Food Ordering Admin System – Full Deployment Guide
==================================================


Prerequisites
==============
Node.js (v18+ recommended)

MongoDB (local or cloud Atlas cluster)

Git installed

WhatsApp API provider (e.g., Twilio WhatsApp API)

SMTP email provider (e.g., Gmail SMTP, SendGrid, Mailgun)

A server or cloud hosting (VPS, Render, Vercel, Netlify)

Docker installed (https://docs.docker.com/get-docker/)

Docker Compose installed


Steps
=====

1.Clone the Repository

git clone <repository-url>
cd <repository-folder>


2.Install Dependencies

cd backend
npm install


3.Configure Environment Variables

PORT=5000
MONGO_URI=your_mongo_db_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_KEY=your_whatsapp_api_key
BASE_CLIENT_URL=http://localhost:3000  # or your deployed frontend URL


4. Run Backend Locally

npm start


5. Frontend Setup

Install Dependencies

cd ../frontend
npm install


6.Run Frontend Locally

npm run dev


7.Dockerfile Setup

Running the Application

docker-compose up --build







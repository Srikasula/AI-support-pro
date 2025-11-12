

# 🤖 AI Support Pro

AI Support Pro is a **full-stack AI-powered customer support system** built with  
**Next.js 14 (frontend)** and **FastAPI (backend)** — enabling users to upload their own documents (PDF, TXT, MD)  
and chat with an intelligent assistant that understands and answers from those documents.

---

## 🚀 Purpose

This project demonstrates how **Retrieval-Augmented Generation (RAG)** can help businesses build  
AI support assistants that provide accurate, context-aware answers from private data.

---

## 🧠 Key Features

- 📁 Upload & index PDF or text documents into a vector store (ChromaDB)
- 💬 Ask natural language questions based on your uploaded data
- 🤖 Contextual AI answers with source citations
- ⚡ Real-time streaming using **SSE (Server-Sent Events)**
- 🧩 Built with **FastAPI + LangChain + OpenAI API + Next.js**
- 🌈 Modern Tailwind CSS UI with real-time chat experience

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Backend** | FastAPI, Python 3.12 |
| **AI / RAG Engine** | LangChain, ChromaDB, Hugging Face Embeddings |
| **Cloud / API** | OpenAI GPT API |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🗂️ Project Structure

AI-support-pro/
│
├── app/ # Next.js frontend
│ ├── chat/ # Chat interface
│ ├── upload/ # Document upload page
│ ├── components/ # Reusable UI components
│ └── page.tsx # Main chatbot UI
│
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── main.py # API routes (chat, upload, health)
│ │ ├── rag.py # RAG logic with LangChain + Chroma
│ │ ├── ingest.py # Document ingestion logic
│ │ ├── auth.py # Authentication placeholder
│ │ └── storage.py # File storage utilities
│ ├── requirements.txt # Python dependencies
│ └── .env.example # Backend environment template
│
├── .env.local # Frontend environment
├── .gitignore # Ignored folders/files
├── README.md # Documentation
└── tailwind.config.ts # Tailwind CSS config


---

## ⚙️ Local Setup

### 🧩 Backend Setup (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Add your OpenAI API Key
echo "OPENAI_API_KEY=sk-your-key" > .env

# Run the backend server
uvicorn app.main:app --reload --port 8000

Visit 👉 http://127.0.0.1:8000/health
You should see:

{"ok": true}

🖥️ Frontend Setup (Next.js)
cd ..
npm install

# Connect the frontend to backend
echo "NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000" > .env.local

# Run frontend
npm run dev


Visit 👉 http://localhost:3000

How It Works

Upload PDF or text documents from the Upload page.

The backend extracts text and creates vector embeddings using LangChain + ChromaDB.

Ask any question in the Chat page.

The assistant searches your vector database and replies with AI-generated answers and citations.

API Testing (with curl)
Health Check
curl http://127.0.0.1:8000/health

Upload Document
curl -X POST http://127.0.0.1:8000/upload \
  -F "files=@/path/to/YourFile.pdf"

Ask a Question
curl -X POST http://127.0.0.1:8000/chat_text \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the refund policy?","session_id":"local"}'

Environment Variables
Backend → backend/.env
OPENAI_API_KEY=your_openai_api_key

Frontend → .env.local
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

Deployment Guide
🌩️ Deploy Backend on Render

Go to https://render.com

Create New Web Service

Select your GitHub repo

Root directory → backend

Build Command → pip install -r requirements.txt

Start Command → uvicorn app.main:app --host 0.0.0.0 --port 10000

Add environment variable:

OPENAI_API_KEY=your_openai_api_key


Deploy → note the backend URL (e.g., https://ai-support-backend.onrender.com)

Deploy Frontend on Vercel

Go to https://vercel.com

Import your GitHub repository

Add environment variable:

NEXT_PUBLIC_BACKEND_URL=https://ai-support-backend.onrender.com


Click Deploy

Once done → open your Vercel URL and test your chatbot!

🧹 .gitignore
node_modules/
.next/
backend/.venv/
backend/.chroma/
backend/ai_support.db
backend/.env
.env.local

🧠 Future Enhancements

🗂️ Add advanced PDF & DOCX parsing (PyMuPDF / Unstructured)

💾 Use PostgreSQL or Pinecone for persistent vector storage

🗣️ Add speech-to-text & text-to-speech

👥 Enable multi-user authentication (JWT)

📊 Add analytics dashboard with chat history

👨‍💻 Author

Srikanth Kasula
Senior Full Stack Developer | Dallas, TX


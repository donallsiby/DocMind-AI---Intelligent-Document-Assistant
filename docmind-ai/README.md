# DocMind AI - Intelligent Document Assistant

DocMind AI is a full-stack AI-powered document assistant that allows users to upload documents (PDF, DOCX, TXT) and chat with them using natural language. Answers are grounded in the uploaded documents using Retrieval-Augmented Generation (RAG).

## Features

- 📄 **Multi-Format Support**: Upload PDF, DOCX, and TXT files
- 💬 **Intelligent Chat**: Chat with your documents using natural language
- 🔍 **Accurate Citations**: Source-grounded answers citing the document and section/page
- 🧠 **Dual LLM Provider Support**: NVIDIA NIM acceleration (`ChatNVIDIA`) or Groq Cloud (`ChatGroq`)
- ⚡ **Local Vector Embeddings**: Fast and private embeddings with HuggingFace MiniLM & ChromaDB
- 🖥️ **Modern Glassmorphism UI**: Built with React, Tailwind CSS, Framer Motion, and dark/light themes
- 🐳 **Container Ready**: Full Docker & Docker Compose support for instant cloud deployment

## Tech Stack

### Frontend
- React 18 (Vite)
- Tailwind CSS
- Framer Motion
- Lucide React & React Icons
- Axios

### Backend Gateway
- Node.js & Express
- Multer (in-memory file handling)
- Axios & Form-Data
- CORS enabled for secure cross-origin requests

### AI Engine (RAG Service)
- Python 3.11+
- FastAPI & Uvicorn
- LangChain & LangChain Community
- LangChain NVIDIA AI Endpoints & LangChain Groq
- ChromaDB (vector database)
- HuggingFace `sentence-transformers/all-MiniLM-L6-v2` (embeddings)

## Architecture

```
React Frontend (port 5173) ──> Express Gateway (port 5000) ──> FastAPI RAG (port 8000) ──> NVIDIA NIM / Groq
```

## Quick Start (Local Development)

### 1-Click Launch (Windows)
Double-click `run_all.bat` or run in PowerShell:
```powershell
./run_all.ps1
```
This automatically starts:
- RAG Service on `http://localhost:8000`
- Backend Gateway on `http://localhost:5000`
- Frontend on `http://localhost:5173`

---

### Manual Setup

#### 1. Configure AI Service (Python)
```bash
cd docmind-ai/rag-service
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```
Edit `.env` to set your API key:
```env
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_MODEL=openai/gpt-oss-20b
# OR for Groq:
# LLM_PROVIDER=groq
# GROQ_API_KEY=your_groq_api_key_here
# GROQ_MODEL=openai/gpt-oss-20b
```
Start the service:
```bash
python main.py
```

#### 2. Configure Backend Gateway (Node.js)
```bash
cd ../backend
npm install
npm run dev
```

#### 3. Configure Frontend (React)
```bash
cd ../frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser!

---

## Deployment Guide

### Option 1: Docker Compose (Any VPS / Cloud Server)
1. Set your `NVIDIA_API_KEY` (or `GROQ_API_KEY`) in your environment.
2. Run:
```bash
docker compose up -d --build
```
Your app is live with all 3 services networked automatically.

### Option 2: Cloud Platforms (Render / Railway / Fly.io)
1. **Frontend**: Deploy `frontend/` as a static site (Vite build: `dist`) on Vercel, Netlify, or Render. Set the proxy or backend URL to your deployed backend API URL.
2. **Backend**: Deploy `backend/` as a Node.js web service on Render or Railway. Set environment variable:
   - `RAG_SERVICE_URL=https://your-rag-service-url`
   - `PORT=5000`
3. **RAG Service**: Deploy `rag-service/` as a Python web service (or Docker service) on Render, Railway, or Hugging Face Spaces. Set environment variables:
   - `NVIDIA_API_KEY=your_key`
   - `LLM_PROVIDER=nvidia`
   - `PORT=8000`
   - `HOST=0.0.0.0`

---

## API Endpoints

### Backend Gateway
- `GET /health` - Gateway health check
- `POST /api/upload` - Upload document (`file`)
- `POST /api/ask` - Ask question (`{ question, fileId }`)

### RAG Service
- `GET /health` - Health status
- `POST /upload` - Process document, extract chunks, create vector embeddings
- `POST /ask` - Retrieve context chunks & invoke LLM

---

## License
MIT
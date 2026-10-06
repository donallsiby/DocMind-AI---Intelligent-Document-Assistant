from fastapi import FastAPI
from app.routers import upload, ask
from app.core.config import settings

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DocMind AI RAG Service",
    description="Retrieval-Augmented Generation service for document chat",
    version="1.0.0"
)

# Enable CORS safely for all origins (local and cloud deployments)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/upload", tags=["upload"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(ask.router, prefix="/ask", tags=["ask"])
app.include_router(ask.router, prefix="/api/ask", tags=["ask"])

@app.on_event("startup")
async def startup_event():
    import threading
    from app.utils.embeddings import get_embeddings
    # Warm up embedding model in background so server responds to health checks immediately
    threading.Thread(target=get_embeddings, daemon=True).start()

@app.get("/")
async def root():
    return {"message": "DocMind AI RAG Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
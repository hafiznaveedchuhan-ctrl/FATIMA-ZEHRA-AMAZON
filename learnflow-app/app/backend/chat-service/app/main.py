"""Chat Service - FastAPI Application with OpenAI Integration"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routes import router

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Chat Service - Fatima Zehra Boutique",
    description="AI Chat Assistant with OpenAI Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8004").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Chat Service",
        "status": "healthy",
        "version": "1.0.0",
        "ai_model": "openai"
    }


@app.get("/health")
async def health():
    """Kubernetes health check"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )

"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes import insights, questions, conversations, analysis

settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="Conversation Insights Analyzer",
    description="Extract insights from AI conversations using LLM analysis",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(insights.router, prefix=settings.api_prefix, tags=["Insights"])
app.include_router(questions.router, prefix=settings.api_prefix, tags=["Questions"])
app.include_router(conversations.router, prefix=settings.api_prefix, tags=["Conversations"])
app.include_router(analysis.router, prefix=settings.api_prefix, tags=["Analysis"])


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Conversation Insights Analyzer",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "openai_configured": bool(settings.openai_api_key),
        "data_dir_exists": settings.data_dir.exists(),
    }

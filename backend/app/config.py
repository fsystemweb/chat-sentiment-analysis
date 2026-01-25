"""Application configuration using Pydantic Settings."""

from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-4"
    
    # Data directory
    data_dir: Path = Path(__file__).parent.parent / "data"
    
    # API Configuration
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def conversations_dir(self) -> Path:
        """Directory for conversation files."""
        return self.data_dir / "conversations"
    
    @property
    def insights_file(self) -> Path:
        """Path to insights JSON file."""
        return self.data_dir / "insights.json"
    
    @property
    def questions_file(self) -> Path:
        """Path to questions JSON file."""
        return self.data_dir / "questions.json"
    
    @property
    def analysis_results_file(self) -> Path:
        """Path to analysis results JSON file."""
        return self.data_dir / "analysis_results.json"
    
    @property
    def prompts_dir(self) -> Path:
        """Directory for prompt templates."""
        return Path(__file__).parent / "agent" / "prompts"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

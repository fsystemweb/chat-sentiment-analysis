"""Fixtures for testing."""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import json

from app.main import app
from app.config import get_settings


@pytest.fixture(scope="module")
def client():
    """Get a test client for the app."""
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def cleanup_data_files():
    """Clear all .json files in the data directory before each test."""
    settings = get_settings()
    data_dir = Path(settings.data_dir)
    
    # Clear analysis results
    analysis_file = Path(settings.analysis_results_file)
    if analysis_file.exists():
        analysis_file.write_text("[]")
        
    # Clear conversations
    conv_dir = Path(settings.conversations_dir)
    if conv_dir.is_dir():
        for f in conv_dir.glob("*.json"):
            # Don't delete the .gitkeep file if it exists
            if f.name != ".gitkeep":
                f.unlink()
                
    # Clear insights and questions (assuming they are single files)
    insights_file = Path(settings.insights_file)
    if insights_file.exists():
        insights_file.write_text("[]")
        
    questions_file = Path(settings.questions_file)
    if questions_file.exists():
        questions_file.write_text("[]")

    yield

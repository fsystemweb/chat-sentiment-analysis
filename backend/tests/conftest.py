"""Pytest configuration and fixtures for integration tests."""

import os
import pytest
import tempfile
import shutil
from pathlib import Path
from fastapi.testclient import TestClient

from app.main import app
from app.config import Settings, get_settings


@pytest.fixture(scope="session")
def test_data_dir():
    """Create a temporary data directory for tests."""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir)


@pytest.fixture(scope="function")
def test_settings(test_data_dir):
    """Override settings for testing."""
    settings = Settings(
        openai_api_key=os.getenv("OPENAI_API_KEY", "test-key"),
        openai_model="gpt-4",
        data_dir=test_data_dir,
        api_prefix="/api",
        cors_origins="http://localhost:3000"
    )
    
    # Create necessary directories
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.conversations_dir.mkdir(parents=True, exist_ok=True)
    
    # Clean up any existing data files
    for file in [settings.insights_file, settings.questions_file, settings.analysis_results_file]:
        if file.exists():
            file.unlink()
    
    # Remove all conversation files
    if settings.conversations_dir.exists():
        for conv_file in settings.conversations_dir.glob("*.json"):
            conv_file.unlink()
    
    return settings


@pytest.fixture(scope="function")
def client(test_settings):
    """Create a test client with overridden settings."""
    # Override the settings dependency
    app.dependency_overrides[get_settings] = lambda: test_settings
    
    # Create test client (app is first positional argument)
    test_client = TestClient(app)
    yield test_client
    test_client.close()
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def clean_data_files(test_settings):
    """Clean up data files before each test."""
    # Remove JSON files if they exist
    for file in [
        test_settings.insights_file,
        test_settings.questions_file,
        test_settings.analysis_results_file
    ]:
        if file.exists():
            file.unlink()
    
    # Remove all conversation files
    if test_settings.conversations_dir.exists():
        for conv_file in test_settings.conversations_dir.glob("*.json"):
            conv_file.unlink()
    
    yield

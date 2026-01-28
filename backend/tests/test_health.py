"""Tests for health check endpoints."""

import pytest


def test_root_endpoint(client):
    """Test the root health check endpoint."""
    response = client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Conversation Insights Analyzer"
    assert data["version"] == "1.0.0"


def test_health_check_endpoint(client):
    """Test the detailed health check endpoint."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "openai_configured" in data
    assert "data_dir_exists" in data
    assert data["data_dir_exists"] is True

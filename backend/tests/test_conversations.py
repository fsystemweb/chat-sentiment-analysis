"""Tests for conversations API endpoints."""

import pytest
from datetime import datetime


def test_list_conversations_empty(client):
    """Test listing conversations when none exist."""
    response = client.get("/api/conversations")
    
    assert response.status_code == 200
    assert response.json() == []


def test_create_conversation(client):
    """Test creating a new conversation."""
    conversation_data = {
        "id": "conv-123",
        "metadata": {
            "title": "Test Conversation",
            "source": "web",
            "participants": ["user-456"]
        },
        "messages": [
            {
                "role": "user",
                "content": "Hello, I need help with my project.",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "role": "assistant",
                "content": "I'd be happy to help! What kind of project are you working on?",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }
    
    response = client.post("/api/conversations", json=conversation_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == conversation_data["id"]
    assert len(data["messages"]) == 2
    assert data["metadata"]["source"] == "web"


def test_list_conversations_with_data(client):
    """Test listing conversations after creating some."""
    # Create two conversations
    conv1 = {
        "id": "conv-1",
        "metadata": {"title": "Conversation 1"},
        "messages": [{"role": "user", "content": "Hi", "timestamp": datetime.utcnow().isoformat()}]
    }
    conv2 = {
        "id": "conv-2",
        "metadata": {"title": "Conversation 2"},
        "messages": [{"role": "user", "content": "Hello", "timestamp": datetime.utcnow().isoformat()}]
    }
    
    client.post("/api/conversations", json=conv1)
    client.post("/api/conversations", json=conv2)
    
    response = client.get("/api/conversations")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Check that summaries are returned (not full conversations)
    assert "message_count" in data[0]


def test_get_conversation_by_id(client):
    """Test getting a specific conversation by ID."""
    # Create a conversation
    conversation_data = {
        "id": "conv-test",
        "metadata": {"title": "Test Conversation"},
        "messages": [
            {"role": "user", "content": "Test message", "timestamp": datetime.utcnow().isoformat()}
        ]
    }
    client.post("/api/conversations", json=conversation_data)
    
    # Get the conversation
    response = client.get("/api/conversations/conv-test")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "conv-test"
    assert len(data["messages"]) == 1
    assert data["messages"][0]["content"] == "Test message"


def test_get_conversation_not_found(client):
    """Test getting a non-existent conversation."""
    response = client.get("/api/conversations/non-existent-id")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_conversation_with_multiple_messages(client):
    """Test creating a conversation with multiple messages."""
    conversation_data = {
        "id": "conv-multi",
        "metadata": {"title": "Multi-message Conversation"},
        "messages": [
            {"role": "user", "content": "Message 1", "timestamp": datetime.utcnow().isoformat()},
            {"role": "assistant", "content": "Response 1", "timestamp": datetime.utcnow().isoformat()},
            {"role": "user", "content": "Message 2", "timestamp": datetime.utcnow().isoformat()},
            {"role": "assistant", "content": "Response 2", "timestamp": datetime.utcnow().isoformat()},
        ]
    }
    
    response = client.post("/api/conversations", json=conversation_data)
    
    assert response.status_code == 201
    data = response.json()
    assert len(data["messages"]) == 4
    
    # Verify we can retrieve it
    get_response = client.get("/api/conversations/conv-multi")
    assert get_response.status_code == 200
    assert len(get_response.json()["messages"]) == 4

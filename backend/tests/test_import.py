"""Tests for conversation import API endpoint."""

import pytest
from datetime import datetime


class TestImportConversation:
    """Tests for POST /conversations/import endpoint."""

    def test_import_conversation_success(self, client):
        """Test successfully importing a valid conversation."""
        conversation_data = {
            "id": "import-test-1",
            "metadata": {
                "title": "Imported Conversation",
                "source": "import",
                "participants": ["User A", "User B"]
            },
            "messages": [
                {
                    "role": "user",
                    "content": "Hello, this is an imported message.",
                    "timestamp": datetime.utcnow().isoformat()
                },
                {
                    "role": "assistant",
                    "content": "Hi! This conversation was imported successfully.",
                    "timestamp": datetime.utcnow().isoformat()
                }
            ]
        }
        
        response = client.post(
            "/api/conversations/import",
            json=conversation_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["id"] == "import-test-1"
        assert data["metadata"]["title"] == "Imported Conversation"
        assert len(data["messages"]) == 2

    def test_import_duplicate_id_conflict(self, client):
        """Test that importing a conversation with existing ID returns 409."""
        conversation_data = {
            "id": "duplicate-test",
            "metadata": {"title": "Original Conversation"},
            "messages": [{"role": "user", "content": "First"}]
        }
        
        # First import should succeed
        response1 = client.post("/api/conversations/import", json=conversation_data)
        assert response1.status_code == 201
        
        # Second import with same ID should fail with 409
        response2 = client.post("/api/conversations/import", json=conversation_data)
        assert response2.status_code == 409
        assert "already exists" in response2.json()["detail"]

    def test_import_invalid_json(self, client):
        """Test that malformed JSON returns 422."""
        response = client.post(
            "/api/conversations/import",
            content="{ invalid json }",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422
        assert "Invalid JSON" in response.json()["detail"]

    def test_import_missing_required_fields(self, client):
        """Test that missing required fields returns 422."""
        # Missing 'metadata' field
        incomplete_data = {
            "id": "incomplete-test",
            "messages": []
        }
        
        response = client.post("/api/conversations/import", json=incomplete_data)
        
        assert response.status_code == 422
        assert "Invalid conversation format" in response.json()["detail"]

    def test_import_missing_id(self, client):
        """Test that missing id field returns 422."""
        no_id_data = {
            "metadata": {"title": "No ID Conversation"},
            "messages": []
        }
        
        response = client.post("/api/conversations/import", json=no_id_data)
        
        assert response.status_code == 422

    def test_import_file_too_large(self, client):
        """Test that payload > 600 KB returns 413."""
        # Create a conversation with a very large message content
        # 600 KB = 614,400 bytes, so we create content slightly larger
        large_content = "x" * (600 * 1024 + 1000)
        
        large_conversation = {
            "id": "large-test",
            "metadata": {"title": "Large Conversation"},
            "messages": [{"role": "user", "content": large_content}]
        }
        
        response = client.post("/api/conversations/import", json=large_conversation)
        
        assert response.status_code == 413
        assert "too large" in response.json()["detail"].lower()

    def test_import_then_retrieve(self, client):
        """Test that imported conversation can be retrieved."""
        conversation_data = {
            "id": "retrieve-test",
            "metadata": {
                "title": "Retrievable Conversation",
                "source": "test",
                "date": "2024-01-15T10:30:00Z"
            },
            "messages": [
                {"role": "agent", "content": "Welcome!"},
                {"role": "user", "content": "Thanks!"}
            ]
        }
        
        # Import
        import_response = client.post("/api/conversations/import", json=conversation_data)
        assert import_response.status_code == 201
        
        # Retrieve
        get_response = client.get("/api/conversations/retrieve-test")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["id"] == "retrieve-test"
        assert data["metadata"]["title"] == "Retrievable Conversation"
        assert len(data["messages"]) == 2

    def test_import_appears_in_list(self, client):
        """Test that imported conversation appears in conversations list."""
        conversation_data = {
            "id": "list-test",
            "metadata": {"title": "Listed Conversation"},
            "messages": [{"role": "user", "content": "Hello"}]
        }
        
        # Import
        client.post("/api/conversations/import", json=conversation_data)
        
        # Check list
        response = client.get("/api/conversations")
        assert response.status_code == 200
        
        data = response.json()
        ids = [conv["id"] for conv in data]
        assert "list-test" in ids

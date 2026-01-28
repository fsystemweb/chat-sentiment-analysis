"""Tests for questions API endpoints."""

import pytest


def test_list_questions_empty(client):
    """Test listing questions when none exist."""
    response = client.get("/api/questions")
    
    assert response.status_code == 200
    assert response.json() == []


def test_create_question(client):
    """Test creating a new question."""
    question_data = {
        "question": "What is the customer's budget?",
        "active": True
    }
    
    response = client.post("/api/questions", json=question_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["question"] == question_data["question"]
    assert data["active"] is True
    assert "id" in data
    assert "created_at" in data


def test_list_questions_with_data(client):
    """Test listing questions after creating some."""
    # Create two questions
    question1 = {"question": "What is the timeline?", "active": True}
    question2 = {"question": "Who are the stakeholders?", "active": False}
    
    client.post("/api/questions", json=question1)
    client.post("/api/questions", json=question2)
    
    response = client.get("/api/questions")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_list_active_questions(client):
    """Test listing only active questions."""
    # Create one active and one inactive question
    active = {"question": "Active question?", "active": True}
    inactive = {"question": "Inactive question?", "active": False}
    
    client.post("/api/questions", json=active)
    client.post("/api/questions", json=inactive)
    
    response = client.get("/api/questions/active")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["question"] == "Active question?"


def test_get_question_by_id(client):
    """Test getting a specific question by ID."""
    # Create a question
    question_data = {"question": "Test question?", "active": True}
    create_response = client.post("/api/questions", json=question_data)
    question_id = create_response.json()["id"]
    
    # Get the question
    response = client.get(f"/api/questions/{question_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == question_id
    assert data["question"] == question_data["question"]


def test_get_question_not_found(client):
    """Test getting a non-existent question."""
    response = client.get("/api/questions/non-existent-id")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_question(client):
    """Test updating an existing question."""
    # Create a question
    question_data = {"question": "Original question?", "active": True}
    create_response = client.post("/api/questions", json=question_data)
    question_id = create_response.json()["id"]
    
    # Update the question
    update_data = {"question": "Updated question?", "active": False}
    response = client.put(f"/api/questions/{question_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["question"] == "Updated question?"
    assert data["active"] is False


def test_update_question_not_found(client):
    """Test updating a non-existent question."""
    update_data = {"question": "Updated question?"}
    response = client.put("/api/questions/non-existent-id", json=update_data)
    
    assert response.status_code == 404


def test_delete_question(client):
    """Test deleting a question."""
    # Create a question
    question_data = {"question": "To delete?", "active": True}
    create_response = client.post("/api/questions", json=question_data)
    question_id = create_response.json()["id"]
    
    # Delete the question
    response = client.delete(f"/api/questions/{question_id}")
    
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = client.get(f"/api/questions/{question_id}")
    assert get_response.status_code == 404


def test_delete_question_not_found(client):
    """Test deleting a non-existent question."""
    response = client.delete("/api/questions/non-existent-id")
    
    assert response.status_code == 404

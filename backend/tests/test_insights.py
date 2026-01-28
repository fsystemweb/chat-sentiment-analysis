"""Tests for insights API endpoints."""

import pytest


def test_list_insights_empty(client):
    """Test listing insights when none exist."""
    response = client.get("/api/insights")
    
    assert response.status_code == 200
    assert response.json() == []


def test_create_insight(client):
    """Test creating a new insight."""
    insight_data = {
        "name": "Customer Pain Point",
        "description": "Main problem the customer is trying to solve",
        "active": True
    }
    
    response = client.post("/api/insights", json=insight_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == insight_data["name"]
    assert data["description"] == insight_data["description"]
    assert data["active"] is True
    assert "id" in data
    assert "created_at" in data


def test_list_insights_with_data(client):
    """Test listing insights after creating some."""
    # Create two insights
    insight1 = {"name": "Pain Point", "description": "Customer problem", "active": True}
    insight2 = {"name": "Budget", "description": "Customer budget", "active": False}
    
    client.post("/api/insights", json=insight1)
    client.post("/api/insights", json=insight2)
    
    response = client.get("/api/insights")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_list_active_insights(client):
    """Test listing only active insights."""
    # Create one active and one inactive insight
    active = {"name": "Active", "description": "Active insight", "active": True}
    inactive = {"name": "Inactive", "description": "Inactive insight", "active": False}
    
    client.post("/api/insights", json=active)
    client.post("/api/insights", json=inactive)
    
    response = client.get("/api/insights/active")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Active"


def test_get_insight_by_id(client):
    """Test getting a specific insight by ID."""
    # Create an insight
    insight_data = {"name": "Test Insight", "description": "Test", "active": True}
    create_response = client.post("/api/insights", json=insight_data)
    insight_id = create_response.json()["id"]
    
    # Get the insight
    response = client.get(f"/api/insights/{insight_id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == insight_id
    assert data["name"] == insight_data["name"]


def test_get_insight_not_found(client):
    """Test getting a non-existent insight."""
    response = client.get("/api/insights/non-existent-id")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_insight(client):
    """Test updating an existing insight."""
    # Create an insight
    insight_data = {"name": "Original", "description": "Original desc", "active": True}
    create_response = client.post("/api/insights", json=insight_data)
    insight_id = create_response.json()["id"]
    
    # Update the insight
    update_data = {"name": "Updated", "description": "Updated desc", "active": False}
    response = client.put(f"/api/insights/{insight_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated"
    assert data["description"] == "Updated desc"
    assert data["active"] is False


def test_update_insight_not_found(client):
    """Test updating a non-existent insight."""
    update_data = {"name": "Updated", "description": "Updated desc"}
    response = client.put("/api/insights/non-existent-id", json=update_data)
    
    assert response.status_code == 404


def test_delete_insight(client):
    """Test deleting an insight."""
    # Create an insight
    insight_data = {"name": "To Delete", "description": "Will be deleted", "active": True}
    create_response = client.post("/api/insights", json=insight_data)
    insight_id = create_response.json()["id"]
    
    # Delete the insight
    response = client.delete(f"/api/insights/{insight_id}")
    
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = client.get(f"/api/insights/{insight_id}")
    assert get_response.status_code == 404


def test_delete_insight_not_found(client):
    """Test deleting a non-existent insight."""
    response = client.delete("/api/insights/non-existent-id")
    
    assert response.status_code == 404

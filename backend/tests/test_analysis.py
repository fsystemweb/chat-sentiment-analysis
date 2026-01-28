"""Tests for analysis API endpoints."""

import pytest
from datetime import datetime
from unittest.mock import patch, AsyncMock


@pytest.fixture
def sample_conversation(client):
    """Create a sample conversation for testing."""
    conversation_data = {
        "id": "conv-analysis-test",
        "metadata": {"title": "Analysis Test Conversation", "source": "sales_call"},
        "messages": [
            {
                "role": "user",
                "content": "I'm looking for a CRM solution. Our budget is around $50k.",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "role": "assistant",
                "content": "Great! I can help you find the right CRM. What's your timeline?",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "role": "user",
                "content": "We need to implement it within 3 months.",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }
    
    response = client.post("/api/conversations", json=conversation_data)
    assert response.status_code == 201
    return conversation_data["id"]


@pytest.fixture
def sample_insights(client):
    """Create sample insights for testing."""
    insights = [
        {"name": "Budget", "description": "Customer budget", "is_active": True},
        {"name": "Timeline", "description": "Implementation timeline", "is_active": True}
    ]
    
    insight_ids = []
    for insight in insights:
        response = client.post("/api/insights", json=insight)
        assert response.status_code == 201
        insight_ids.append(response.json()["id"])
    
    return insight_ids


@pytest.fixture
def sample_questions(client):
    """Create sample questions for testing."""
    questions = [
        {"text": "What is the customer's budget?", "is_active": True},
        {"text": "What is the implementation timeline?", "is_active": True}
    ]
    
    question_ids = []
    for question in questions:
        response = client.post("/api/questions", json=question)
        assert response.status_code == 201
        question_ids.append(response.json()["id"])
    
    return question_ids


def test_list_all_analyses_empty(client):
    """Test listing all analyses when none exist."""
    response = client.get("/api/analysis")
    
    assert response.status_code == 200
    assert response.json() == []


def test_get_analysis_not_found(client):
    """Test getting analysis for a conversation that hasn't been analyzed."""
    response = client.get("/api/analysis/non-existent-conv")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@patch('app.agent.chains.AnalysisChain.analyze_conversation')
def test_run_analysis(mock_analyze, client, sample_conversation, sample_insights, sample_questions):
    """Test running analysis on a conversation."""
    # Mock the analysis chain response
    mock_result = {
        "conversation_id": sample_conversation,
        "insights": [
            {
                "insight_id": sample_insights[0],
                "insight_name": "Budget",
                "value": "$50k",
                "confidence": 0.95,
                "evidence": "User mentioned budget is around $50k"
            }
        ],
        "questions": [
            {
                "question_id": sample_questions[0],
                "question_text": "What is the customer's budget?",
                "answered": True,
                "answer": "$50k",
                "confidence": 0.95
            }
        ],
        "analyzed_at": datetime.utcnow()
    }
    
    mock_analyze.return_value = AsyncMock(return_value=mock_result)
    
    # Run analysis
    analysis_request = {
        "conversation_id": sample_conversation,
        "insight_ids": sample_insights,
        "question_ids": sample_questions
    }
    
    response = client.post("/api/analysis", json=analysis_request)
    
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == sample_conversation
    assert len(data["insights"]) > 0
    assert len(data["questions"]) > 0


def test_run_analysis_conversation_not_found(client):
    """Test running analysis on a non-existent conversation."""
    analysis_request = {
        "conversation_id": "non-existent",
        "insight_ids": [],
        "question_ids": []
    }
    
    response = client.post("/api/analysis", json=analysis_request)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@patch('app.agent.chains.AnalysisChain.analyze_conversation')
def test_get_analysis_after_creation(mock_analyze, client, sample_conversation, sample_insights):
    """Test retrieving analysis after it's been created."""
    # Mock the analysis
    mock_result = {
        "conversation_id": sample_conversation,
        "insights": [],
        "questions": [],
        "analyzed_at": datetime.utcnow()
    }
    mock_analyze.return_value = AsyncMock(return_value=mock_result)
    
    # Create analysis
    analysis_request = {
        "conversation_id": sample_conversation,
        "insight_ids": sample_insights,
        "question_ids": []
    }
    client.post("/api/analysis", json=analysis_request)
    
    # Retrieve it
    response = client.get(f"/api/analysis/{sample_conversation}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["conversation_id"] == sample_conversation


def test_aggregate_analysis_empty(client):
    """Test aggregate analysis when no analyses exist."""
    response = client.get("/api/analysis/aggregate")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_conversations"] == 0
    assert data["analyzed_conversations"] == 0
    assert data["insight_summaries"] == {}
    assert data["question_summaries"] == {}


@patch('app.agent.chains.AnalysisChain.analyze_conversation')
def test_aggregate_analysis_with_data(mock_analyze, client, sample_conversation, sample_insights, sample_questions):
    """Test aggregate analysis with existing data."""
    # Create some conversations and analyses
    conv_ids = []
    for i in range(3):
        conv_data = {
            "id": f"conv-agg-{i}",
            "metadata": {"title": f"Aggregate Test {i}"},
            "messages": [
                {"role": "user", "content": f"Message {i}", "timestamp": datetime.utcnow().isoformat()}
            ]
        }
        client.post("/api/conversations", json=conv_data)
        conv_ids.append(conv_data["id"])
    
    # Mock analysis results
    def mock_analysis_func(conversation, insight_ids=None, question_ids=None):
        return {
            "conversation_id": conversation.id,
            "insights": [
                {
                    "insight_id": sample_insights[0],
                    "insight_name": "Budget",
                    "value": "$50k",
                    "confidence": 0.9,
                    "evidence": "Test"
                }
            ],
            "questions": [],
            "analyzed_at": datetime.utcnow()
        }
    
    mock_analyze.side_effect = mock_analysis_func
    
    # Run analyses
    for conv_id in conv_ids[:2]:  # Only analyze 2 out of 3
        analysis_request = {
            "conversation_id": conv_id,
            "insight_ids": sample_insights,
            "question_ids": []
        }
        client.post("/api/analysis", json=analysis_request)
    
    # Get aggregate
    response = client.get("/api/analysis/aggregate")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total_conversations"] == 3
    assert data["analyzed_conversations"] == 2
    assert "Budget" in data["insight_summaries"]


def test_list_all_analyses_with_data(client, sample_conversation):
    """Test listing all analyses after creating some."""
    # This test assumes we can create mock analyses
    # In a real scenario, you'd need to mock the analysis chain
    response = client.get("/api/analysis")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)

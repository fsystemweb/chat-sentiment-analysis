"""Analysis result data models."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.insight import InsightResult
from app.models.question import QuestionResult


class AnalysisRequest(BaseModel):
    """Request to run analysis on a conversation."""
    conversation_id: str = Field(..., description="ID of the conversation to analyze")
    insight_ids: Optional[List[str]] = Field(None, description="Specific insight IDs to extract (None = all active)")
    question_ids: Optional[List[str]] = Field(None, description="Specific question IDs to check (None = all active)")


class ConversationAnalysis(BaseModel):
    """Complete analysis results for a single conversation."""
    id: str = Field(..., description="Unique ID for this analysis")
    conversation_id: str
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    insights: List[InsightResult] = Field(default=[], description="Extracted insights")
    questions: List[QuestionResult] = Field(default=[], description="Question results")
    summary: Optional[str] = Field(None, description="Overall conversation summary")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AggregateAnalysis(BaseModel):
    """Aggregate analysis across multiple conversations."""
    total_conversations: int
    analyzed_conversations: int
    insight_summaries: dict = Field(default={}, description="Aggregated insight data")
    question_summaries: dict = Field(default={}, description="Aggregated question data")
    generated_at: datetime = Field(default_factory=datetime.utcnow)

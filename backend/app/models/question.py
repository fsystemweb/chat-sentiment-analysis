"""Qualifying question data models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class QuestionBase(BaseModel):
    """Base question model with common fields."""
    question: str = Field(..., min_length=1, description="The qualifying question to look for")
    description: Optional[str] = Field(None, description="Additional context about the question")
    active: bool = Field(default=True, description="Whether this question is active for analysis")


class QuestionCreate(QuestionBase):
    """Model for creating a new question."""
    pass


class QuestionUpdate(BaseModel):
    """Model for updating a question (all fields optional)."""
    question: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    active: Optional[bool] = None


class Question(QuestionBase):
    """Complete question model with ID and timestamps."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class QuestionResult(BaseModel):
    """Result of question extraction for a conversation."""
    question_id: str
    question_text: str
    answered: bool = Field(..., description="Whether the question was answered in the conversation")
    answer: Optional[str] = Field(None, description="The extracted answer if found")
    evidence: Optional[str] = Field(None, description="Quote from conversation containing the answer")

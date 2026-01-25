"""Insight data models."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class InsightBase(BaseModel):
    """Base insight model with common fields."""
    name: str = Field(..., min_length=1, max_length=200, description="Name of the insight")
    description: str = Field(..., min_length=1, description="Description of what to extract")
    active: bool = Field(default=True, description="Whether this insight is active for analysis")


class InsightCreate(InsightBase):
    """Model for creating a new insight."""
    pass


class InsightUpdate(BaseModel):
    """Model for updating an insight (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    active: Optional[bool] = None


class Insight(InsightBase):
    """Complete insight model with ID and timestamps."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class InsightResult(BaseModel):
    """Result of insight extraction for a conversation."""
    insight_id: str
    insight_name: str
    value: str = Field(..., description="Extracted insight value")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    evidence: Optional[str] = Field(None, description="Quote from conversation supporting the insight")

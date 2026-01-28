from pydantic import BaseModel, Field
from typing import List, Optional


class InsightItem(BaseModel):
    """Single insight extraction result matching domain model."""
    insight_id: str
    insight_name: str
    value: str = Field(..., description="Extracted insight value")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    evidence: Optional[str] = Field(None, description="Quote from conversation supporting the insight")


class InsightResult(BaseModel):
    """Wrapper for list of insight results for LangChain parser."""
    insights: List[InsightItem]


class QuestionItem(BaseModel):
    """Single question answer result matching domain model."""
    question_id: str
    question_text: str
    answered: bool
    answer: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)


class AnswerResult(BaseModel):
    """Wrapper for list of question results for LangChain parser."""
    questions: List[QuestionItem]


class Summary(BaseModel):
    """Summary result."""
    summary: str

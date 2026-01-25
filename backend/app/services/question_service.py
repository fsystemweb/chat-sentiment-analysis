"""Question management service."""

from datetime import datetime
from typing import List, Optional

from app.config import get_settings
from app.models.question import Question, QuestionCreate, QuestionUpdate
from app.services.storage_service import StorageService


class QuestionService:
    """Service for managing qualifying questions."""
    
    def __init__(self):
        settings = get_settings()
        self.storage = StorageService(settings.questions_file, Question)
    
    async def get_all(self) -> List[Question]:
        """Get all questions."""
        return await self.storage.get_all()
    
    async def get_active(self) -> List[Question]:
        """Get all active questions."""
        return await self.storage.get_active()
    
    async def get_by_id(self, question_id: str) -> Optional[Question]:
        """Get a specific question by ID."""
        return await self.storage.get_by_id(question_id)
    
    async def create(self, data: QuestionCreate) -> Question:
        """Create a new question."""
        question = Question(**data.model_dump())
        return await self.storage.create(question)
    
    async def update(self, question_id: str, data: QuestionUpdate) -> Optional[Question]:
        """Update an existing question."""
        updates = data.model_dump(exclude_unset=True)
        updates['updated_at'] = datetime.utcnow().isoformat()
        return await self.storage.update(question_id, updates)
    
    async def delete(self, question_id: str) -> bool:
        """Delete a question."""
        return await self.storage.delete(question_id)


# Singleton instance
_question_service: Optional[QuestionService] = None


def get_question_service() -> QuestionService:
    """Get or create the question service singleton."""
    global _question_service
    if _question_service is None:
        _question_service = QuestionService()
    return _question_service

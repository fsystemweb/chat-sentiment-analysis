"""Insight management service."""

from datetime import datetime
from typing import List, Optional

from app.config import get_settings
from app.models.insight import Insight, InsightCreate, InsightUpdate
from app.services.storage_service import StorageService


class InsightService:
    """Service for managing insights."""
    
    def __init__(self):
        settings = get_settings()
        self.storage = StorageService(settings.insights_file, Insight)
    
    async def get_all(self) -> List[Insight]:
        """Get all insights."""
        return await self.storage.get_all()
    
    async def get_active(self) -> List[Insight]:
        """Get all active insights."""
        return await self.storage.get_active()
    
    async def get_by_id(self, insight_id: str) -> Optional[Insight]:
        """Get a specific insight by ID."""
        return await self.storage.get_by_id(insight_id)
    
    async def create(self, data: InsightCreate) -> Insight:
        """Create a new insight."""
        insight = Insight(**data.model_dump())
        return await self.storage.create(insight)
    
    async def update(self, insight_id: str, data: InsightUpdate) -> Optional[Insight]:
        """Update an existing insight."""
        updates = data.model_dump(exclude_unset=True)
        updates['updated_at'] = datetime.utcnow().isoformat()
        return await self.storage.update(insight_id, updates)
    
    async def delete(self, insight_id: str) -> bool:
        """Delete an insight."""
        return await self.storage.delete(insight_id)


# Singleton instance
_insight_service: Optional[InsightService] = None


def get_insight_service() -> InsightService:
    """Get or create the insight service singleton."""
    global _insight_service
    if _insight_service is None:
        _insight_service = InsightService()
    return _insight_service

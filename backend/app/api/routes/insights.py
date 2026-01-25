"""Insights API routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status

from app.models.insight import Insight, InsightCreate, InsightUpdate
from app.services.insight_service import get_insight_service

router = APIRouter()


@router.get("/insights", response_model=List[Insight])
async def list_insights():
    """Get all insights."""
    service = get_insight_service()
    return await service.get_all()


@router.get("/insights/active", response_model=List[Insight])
async def list_active_insights():
    """Get all active insights."""
    service = get_insight_service()
    return await service.get_active()


@router.get("/insights/{insight_id}", response_model=Insight)
async def get_insight(insight_id: str):
    """Get a specific insight by ID."""
    service = get_insight_service()
    insight = await service.get_by_id(insight_id)
    if not insight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with ID '{insight_id}' not found"
        )
    return insight


@router.post("/insights", response_model=Insight, status_code=status.HTTP_201_CREATED)
async def create_insight(data: InsightCreate):
    """Create a new insight."""
    service = get_insight_service()
    return await service.create(data)


@router.put("/insights/{insight_id}", response_model=Insight)
async def update_insight(insight_id: str, data: InsightUpdate):
    """Update an existing insight."""
    service = get_insight_service()
    insight = await service.update(insight_id, data)
    if not insight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with ID '{insight_id}' not found"
        )
    return insight


@router.delete("/insights/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insight(insight_id: str):
    """Delete an insight."""
    service = get_insight_service()
    deleted = await service.delete(insight_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with ID '{insight_id}' not found"
        )

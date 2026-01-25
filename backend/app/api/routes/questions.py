"""Questions API routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status

from app.models.question import Question, QuestionCreate, QuestionUpdate
from app.services.question_service import get_question_service

router = APIRouter()


@router.get("/questions", response_model=List[Question])
async def list_questions():
    """Get all qualifying questions."""
    service = get_question_service()
    return await service.get_all()


@router.get("/questions/active", response_model=List[Question])
async def list_active_questions():
    """Get all active qualifying questions."""
    service = get_question_service()
    return await service.get_active()


@router.get("/questions/{question_id}", response_model=Question)
async def get_question(question_id: str):
    """Get a specific question by ID."""
    service = get_question_service()
    question = await service.get_by_id(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{question_id}' not found"
        )
    return question


@router.post("/questions", response_model=Question, status_code=status.HTTP_201_CREATED)
async def create_question(data: QuestionCreate):
    """Create a new qualifying question."""
    service = get_question_service()
    return await service.create(data)


@router.put("/questions/{question_id}", response_model=Question)
async def update_question(question_id: str, data: QuestionUpdate):
    """Update an existing question."""
    service = get_question_service()
    question = await service.update(question_id, data)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{question_id}' not found"
        )
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: str):
    """Delete a question."""
    service = get_question_service()
    deleted = await service.delete(question_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{question_id}' not found"
        )

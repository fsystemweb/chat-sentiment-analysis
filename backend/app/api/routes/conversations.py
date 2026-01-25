"""Conversations API routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status

from app.models.conversation import Conversation, ConversationSummary
from app.services.conversation_service import get_conversation_service

router = APIRouter()


@router.get("/conversations", response_model=List[ConversationSummary])
async def list_conversations():
    """Get summaries of all conversations."""
    service = get_conversation_service()
    return await service.get_all_summaries()


@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get a specific conversation by ID."""
    service = get_conversation_service()
    conversation = await service.get_by_id(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found"
        )
    return conversation


@router.post("/conversations", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(conversation: Conversation):
    """Create a new conversation."""
    service = get_conversation_service()
    return await service.create(conversation)

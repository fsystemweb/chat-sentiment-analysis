"""Conversations API routes."""

from typing import List
from fastapi import APIRouter, HTTPException, Request, status

from app.models.conversation import Conversation, ConversationSummary
from app.services.conversation_service import get_conversation_service

router = APIRouter()

# Maximum import file size: 600 KB
MAX_IMPORT_SIZE_BYTES = 600 * 1024


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


@router.post("/conversations/import", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def import_conversation(request: Request):
    """Import a single conversation from JSON.
    
    Maximum file size: 600 KB.
    Returns 409 Conflict if conversation ID already exists.
    """
    # Check content length header
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_IMPORT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is 600 KB."
        )
    
    # Read and validate body size
    body = await request.body()
    if len(body) > MAX_IMPORT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is 600 KB."
        )
    
    # Parse JSON
    try:
        import json
        data = json.loads(body)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid JSON: {str(e)}"
        )
    
    # Validate against Conversation model
    try:
        conversation = Conversation(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid conversation format: {str(e)}"
        )
    
    # Check for duplicate
    service = get_conversation_service()
    if await service.exists(conversation.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Conversation with ID '{conversation.id}' already exists"
        )
    
    return await service.create(conversation)


@router.post("/conversations", response_model=Conversation, status_code=status.HTTP_201_CREATED)
async def create_conversation(conversation: Conversation):
    """Create a new conversation."""
    service = get_conversation_service()
    return await service.create(conversation)

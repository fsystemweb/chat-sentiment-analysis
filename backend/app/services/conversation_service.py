"""Conversation management service."""

import json
from pathlib import Path
from typing import List, Optional

from app.config import get_settings
from app.models.conversation import Conversation, ConversationSummary, ConversationMetadata, Message


class ConversationService:
    """Service for managing conversations loaded from files."""
    
    def __init__(self):
        settings = get_settings()
        self.conversations_dir = settings.conversations_dir
        self._ensure_dir_exists()
    
    def _ensure_dir_exists(self) -> None:
        """Ensure the conversations directory exists."""
        self.conversations_dir.mkdir(parents=True, exist_ok=True)
    
    def _load_conversation_file(self, file_path: Path) -> Optional[Conversation]:
        """Load a conversation from a JSON file."""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Use filename (without extension) as ID if not present
            if 'id' not in data:
                data['id'] = file_path.stem
            
            return Conversation(**data)
        except Exception as e:
            print(f"Error loading conversation from {file_path}: {e}")
            return None
    
    async def get_all(self) -> List[Conversation]:
        """Get all conversations from the conversations directory."""
        conversations = []
        for file_path in self.conversations_dir.glob("*.json"):
            conv = self._load_conversation_file(file_path)
            if conv:
                conversations.append(conv)
        return sorted(conversations, key=lambda c: c.metadata.date or "", reverse=True)
    
    async def get_all_summaries(self, analysis_results: dict = None) -> List[ConversationSummary]:
        """Get summaries of all conversations."""
        conversations = await self.get_all()
        summaries = []
        for conv in conversations:
            has_analysis = analysis_results and conv.id in analysis_results if analysis_results else False
            summaries.append(ConversationSummary(
                id=conv.id,
                title=conv.metadata.title,
                source=conv.metadata.source,
                date=conv.metadata.date,
                message_count=conv.message_count,
                has_analysis=has_analysis
            ))
        return summaries
    
    async def get_by_id(self, conversation_id: str) -> Optional[Conversation]:
        """Get a specific conversation by ID."""
        file_path = self.conversations_dir / f"{conversation_id}.json"
        if file_path.exists():
            return self._load_conversation_file(file_path)
        
        # Search all files if exact match not found
        for file_path in self.conversations_dir.glob("*.json"):
            conv = self._load_conversation_file(file_path)
            if conv and conv.id == conversation_id:
                return conv
        
        return None
    
    async def create(self, conversation: Conversation) -> Conversation:
        """Save a new conversation to a file."""
        file_path = self.conversations_dir / f"{conversation.id}.json"
        with open(file_path, 'w') as f:
            json.dump(conversation.model_dump(), f, indent=2, default=str)
        return conversation


# Singleton instance
_conversation_service: Optional[ConversationService] = None


def get_conversation_service() -> ConversationService:
    """Get or create the conversation service singleton."""
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service

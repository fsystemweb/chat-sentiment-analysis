"""Conversation data models."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Message(BaseModel):
    """A single message in a conversation."""
    role: str = Field(..., description="Role of the speaker (e.g., 'user', 'assistant', 'agent')")
    content: str = Field(..., description="Content of the message")
    timestamp: Optional[datetime] = Field(None, description="When the message was sent")


class ConversationMetadata(BaseModel):
    """Metadata about a conversation."""
    title: str = Field(..., description="Title of the conversation")
    source: Optional[str] = Field(None, description="Source of the conversation (e.g., 'sales_call', 'support')")
    date: Optional[datetime] = Field(None, description="Date of the conversation")
    participants: Optional[List[str]] = Field(default=[], description="List of participants")
    tags: Optional[List[str]] = Field(default=[], description="Tags for categorization")


class Conversation(BaseModel):
    """Complete conversation model."""
    id: str = Field(..., description="Unique identifier for the conversation")
    metadata: ConversationMetadata
    messages: List[Message] = Field(default=[], description="List of messages in the conversation")
    
    @property
    def message_count(self) -> int:
        """Number of messages in the conversation."""
        return len(self.messages)
    
    @property
    def full_text(self) -> str:
        """Get the full conversation as a single text string."""
        lines = []
        for msg in self.messages:
            lines.append(f"{msg.role}: {msg.content}")
        return "\n\n".join(lines)


class ConversationSummary(BaseModel):
    """Summary view of a conversation for listing."""
    id: str
    title: str
    source: Optional[str] = None
    date: Optional[datetime] = None
    message_count: int
    has_analysis: bool

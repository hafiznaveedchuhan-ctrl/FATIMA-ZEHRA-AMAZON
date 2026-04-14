"""Chat Service Models - SQLModel Schemas"""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON


# Database Model
class ChatMessage(SQLModel, table=True):
    """Chat message history table"""
    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, index=True)
    session_id: str = Field(index=True, max_length=100)
    role: str = Field(max_length=20)  # "user" or "assistant"
    content: str
    msg_metadata: Optional[dict] = Field(default=None, sa_column=Column("metadata", JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


# Request Models
class ChatMessageRequest(SQLModel):
    """Chat message request"""
    text: str
    session_id: str
    user_id: Optional[int] = None


class ChatHistoryQuery(SQLModel):
    """Query chat history"""
    session_id: str
    limit: int = 50
    offset: int = 0


# Response Models
class ChatMessageResponse(SQLModel):
    """Chat message response"""
    id: int
    session_id: str
    role: str
    content: str
    created_at: datetime


class ChatHistoryResponse(SQLModel):
    """Chat history response"""
    messages: list[ChatMessageResponse]
    total: int
    session_id: str

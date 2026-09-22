from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TicketStatus(StrEnum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class TicketPriority(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class SupportTicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    category: str = Field(default="GENERAL", max_length=50)
    priority: TicketPriority = TicketPriority.MEDIUM


class SupportTicketAdminUpdate(BaseModel):
    status: TicketStatus | None = None
    admin_response: str | None = Field(default=None, max_length=5000)


class SupportTicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    subject: str
    description: str
    category: str
    status: TicketStatus
    priority: TicketPriority
    admin_response: str | None
    created_at: datetime
    updated_at: datetime

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    message: str
    is_read: bool
    notification_type: str | None
    related_id: UUID | None
    created_at: datetime


class NotificationMarkRead(BaseModel):
    notification_id: UUID

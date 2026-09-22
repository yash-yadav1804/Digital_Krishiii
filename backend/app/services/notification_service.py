from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.notification import Notification


def create_notification(
    db: AsyncSession,
    *,
    user_id: UUID,
    title: str,
    message: str,
    notification_type: str,
    related_id: UUID | None = None,
) -> Notification:
    """Stage a notification in the caller's active database transaction."""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_id=related_id,
    )
    db.add(notification)
    return notification

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.support_ticket import SupportTicket
from app.repositories.support_ticket_repository import SupportTicketRepository
from app.schemas.support_ticket import (
    SupportTicketAdminUpdate,
    SupportTicketCreate,
)
from app.services.notification_service import create_notification


class SupportTicketService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = SupportTicketRepository(db)

    async def create(
        self, *, user_id: UUID, data: SupportTicketCreate
    ) -> SupportTicket:
        ticket = SupportTicket(
            user_id=user_id,
            subject=data.subject,
            description=data.description,
            category=data.category,
            priority=data.priority.value,
            status="OPEN",
        )
        return await self.repository.create(ticket)

    async def get_mine(self, user_id: UUID) -> list[SupportTicket]:
        return await self.repository.get_by_user(user_id)

    async def get_all(self) -> list[SupportTicket]:
        return await self.repository.get_all()

    async def update_by_admin(
        self, *, ticket_id: UUID, data: SupportTicketAdminUpdate
    ) -> SupportTicket:
        ticket = await self.repository.get_by_id(ticket_id)
        if ticket is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Support ticket not found"
            )
        if data.status is not None:
            ticket.status = data.status.value
        if data.admin_response is not None:
            ticket.admin_response = data.admin_response
            create_notification(
                self.db,
                user_id=ticket.user_id,
                title="Support ticket updated",
                message=f"An admin responded to your ticket: '{ticket.subject}'.",
                notification_type="SUPPORT_RESPONSE",
                related_id=ticket.id,
            )
        return await self.repository.update(ticket)

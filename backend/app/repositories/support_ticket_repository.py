from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.support_ticket import SupportTicket


class SupportTicketRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, ticket: SupportTicket) -> SupportTicket:
        self.db.add(ticket)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def get_by_id(self, ticket_id: UUID) -> SupportTicket | None:
        result = await self.db.execute(
            select(SupportTicket).where(SupportTicket.id == ticket_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: UUID) -> list[SupportTicket]:
        result = await self.db.execute(
            select(SupportTicket)
            .where(SupportTicket.user_id == user_id)
            .order_by(SupportTicket.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_all(self) -> list[SupportTicket]:
        result = await self.db.execute(
            select(SupportTicket).order_by(SupportTicket.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, ticket: SupportTicket) -> SupportTicket:
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

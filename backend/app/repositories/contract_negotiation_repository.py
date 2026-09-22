from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract_negotiation import ContractNegotiation


class ContractNegotiationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, negotiation: ContractNegotiation) -> ContractNegotiation:
        self.db.add(negotiation)
        await self.db.commit()
        await self.db.refresh(negotiation)
        return negotiation

    async def get_by_id(self, negotiation_id: UUID) -> ContractNegotiation | None:
        result = await self.db.execute(
            select(ContractNegotiation).where(ContractNegotiation.id == negotiation_id)
        )
        return result.scalar_one_or_none()

    async def get_by_contract(self, contract_id: UUID) -> list[ContractNegotiation]:
        result = await self.db.execute(
            select(ContractNegotiation)
            .where(ContractNegotiation.contract_id == contract_id)
            .order_by(ContractNegotiation.created_at.asc())
        )
        return list(result.scalars().all())

    async def update(self, negotiation: ContractNegotiation) -> ContractNegotiation:
        await self.db.commit()
        await self.db.refresh(negotiation)
        return negotiation

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.equipment_request import EquipmentRequest


class EquipmentRequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, request: EquipmentRequest) -> EquipmentRequest:
        self.db.add(request)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def get_by_id(self, request_id: UUID) -> EquipmentRequest | None:
        result = await self.db.execute(select(EquipmentRequest).where(EquipmentRequest.id == request_id))
        return result.scalar_one_or_none()

    async def get_by_equipment(self, equipment_id: UUID) -> list[EquipmentRequest]:
        result = await self.db.execute(
            select(EquipmentRequest).where(EquipmentRequest.equipment_id == equipment_id).order_by(EquipmentRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_farmer(self, farmer_id: UUID) -> list[EquipmentRequest]:
        result = await self.db.execute(
            select(EquipmentRequest).where(EquipmentRequest.farmer_id == farmer_id).order_by(EquipmentRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, request: EquipmentRequest) -> EquipmentRequest:
        await self.db.commit()
        await self.db.refresh(request)
        return request

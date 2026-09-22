from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.equipment import Equipment


class EquipmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, equipment: Equipment) -> Equipment:
        self.db.add(equipment)
        await self.db.commit()
        await self.db.refresh(equipment)
        return equipment

    async def get_by_id(self, equipment_id: UUID) -> Equipment | None:
        result = await self.db.execute(select(Equipment).where(Equipment.id == equipment_id))
        return result.scalar_one_or_none()

    async def get_available(self) -> list[Equipment]:
        result = await self.db.execute(
            select(Equipment).where(Equipment.is_available.is_(True)).order_by(Equipment.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_provider(self, provider_id: UUID) -> list[Equipment]:
        result = await self.db.execute(
            select(Equipment).where(Equipment.provider_id == provider_id).order_by(Equipment.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, equipment: Equipment) -> Equipment:
        await self.db.commit()
        await self.db.refresh(equipment)
        return equipment

    async def delete(self, equipment: Equipment) -> None:
        await self.db.delete(equipment)
        await self.db.commit()

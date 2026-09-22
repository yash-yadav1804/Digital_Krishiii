from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.equipment import Equipment
from app.repositories.equipment_repository import EquipmentRepository
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate


class EquipmentService:
    def __init__(self, db: AsyncSession):
        self.repository = EquipmentRepository(db)

    async def create(self, *, provider_id: UUID, data: EquipmentCreate) -> Equipment:
        equipment = Equipment(provider_id=provider_id, **data.model_dump())
        return await self.repository.create(equipment)

    async def get_available(self) -> list[Equipment]:
        return await self.repository.get_available()

    async def get_mine(self, provider_id: UUID) -> list[Equipment]:
        return await self.repository.get_by_provider(provider_id)

    async def get_owned(self, equipment_id: UUID, provider_id: UUID) -> Equipment:
        equipment = await self.repository.get_by_id(equipment_id)
        if equipment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Equipment not found")
        if equipment.provider_id != provider_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to manage this equipment")
        return equipment

    async def update(self, *, equipment_id: UUID, provider_id: UUID, data: EquipmentUpdate) -> Equipment:
        equipment = await self.get_owned(equipment_id, provider_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(equipment, field, value)
        return await self.repository.update(equipment)

    async def delete(self, *, equipment_id: UUID, provider_id: UUID) -> None:
        equipment = await self.get_owned(equipment_id, provider_id)
        await self.repository.delete(equipment)

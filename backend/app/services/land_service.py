import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.land import Land
from app.repositories.land_repository import LandRepository
from app.schemas.land import LandCreate, LandUpdate


class LandService:
    def __init__(self, session: AsyncSession):
        self.repository = LandRepository(session)

    async def create_land(
        self,
        farmer_id: uuid.UUID,
        data: LandCreate,
    ) -> Land:
        land = Land(
            farmer_id=farmer_id,
            land_name=data.land_name,
            village=data.village,
            district=data.district,
            state=data.state,
            area_acres=data.area_acres,
            soil_type=data.soil_type,
            irrigation_type=data.irrigation_type,
        )

        return await self.repository.create(land)

    async def get_farmer_lands(
        self,
        farmer_id: uuid.UUID,
    ) -> list[Land]:
        return await self.repository.get_by_farmer_id(farmer_id)

    async def get_land(
        self,
        farmer_id: uuid.UUID,
        land_id: uuid.UUID,
    ) -> Land:
        land = await self.repository.get_by_id(land_id)

        if land is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land not found",
            )

        if land.farmer_id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this land",
            )

        return land

    async def update_land(
        self,
        farmer_id: uuid.UUID,
        land_id: uuid.UUID,
        data: LandUpdate,
    ) -> Land:
        land = await self.get_land(
            farmer_id=farmer_id,
            land_id=land_id,
        )

        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(land, field, value)

        return await self.repository.update(land)

    async def delete_land(
        self,
        farmer_id: uuid.UUID,
        land_id: uuid.UUID,
    ) -> None:
        land = await self.get_land(
            farmer_id=farmer_id,
            land_id=land_id,
        )

        await self.repository.delete(land)

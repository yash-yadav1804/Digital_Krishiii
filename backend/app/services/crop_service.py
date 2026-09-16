from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.crop import Crop
from app.repositories import crop_repository
from app.repositories.crop_repository import (
    create_crop as create_crop_record,
)
from app.repositories.land_repository import get_land_by_id
from app.schemas.crop import CropCreate, CropUpdate


async def create_crop(
    db: AsyncSession,
    farmer_id: UUID,
    data: CropCreate,
) -> Crop:
    land = await get_land_by_id(
        db=db,
        land_id=data.land_id,
    )

    if land is None or land.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land not found",
        )

    crop = Crop(
        farmer_id=farmer_id,
        land_id=data.land_id,
        crop_name=data.crop_name,
        season=data.season,
        sowing_date=data.sowing_date,
        expected_harvest_date=data.expected_harvest_date,
        expected_yield=data.expected_yield,
    )

    return await create_crop_record(db, crop)


async def get_crop(
    db: AsyncSession,
    farmer_id: UUID,
    crop_id: UUID,
) -> Crop:
    crop = await crop_repository.get_crop_by_id(db, crop_id)

    if crop is None or crop.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop not found",
        )

    return crop


async def get_farmer_crops(
    db: AsyncSession,
    farmer_id: UUID,
    season: str | None = None,
    crop_name: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Crop]:
    return await crop_repository.get_crops_by_farmer(
        db=db,
        farmer_id=farmer_id,
        season=season,
        crop_name=crop_name,
        skip=skip,
        limit=limit,
    )


async def update_crop(
    db: AsyncSession,
    farmer_id: UUID,
    crop_id: UUID,
    data: CropUpdate,
) -> Crop:
    crop = await get_crop(db, farmer_id, crop_id)

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(crop, field, value)

    return await crop_repository.update_crop(db, crop)


async def delete_crop(
    db: AsyncSession,
    farmer_id: UUID,
    crop_id: UUID,
) -> None:
    crop = await get_crop(db, farmer_id, crop_id)

    await crop_repository.delete_crop(db, crop)

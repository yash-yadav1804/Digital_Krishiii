from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.crop import Crop


async def create_crop(
    db: AsyncSession,
    crop: Crop,
) -> Crop:
    db.add(crop)
    await db.commit()
    await db.refresh(crop)

    return crop


async def get_crop_by_id(
    db: AsyncSession,
    crop_id: UUID,
) -> Crop | None:
    result = await db.execute(select(Crop).where(Crop.id == crop_id))

    return result.scalar_one_or_none()


async def get_crops_by_farmer(
    db: AsyncSession,
    farmer_id: UUID,
    season: str | None = None,
    crop_name: str | None = None,
    skip: int = 0,
    limit: int = 10,
) -> list[Crop]:
    query = (
        select(Crop).where(Crop.farmer_id == farmer_id).order_by(Crop.created_at.desc())
    )

    if season:
        query = query.where(Crop.season == season)

    if crop_name:
        query = query.where(Crop.crop_name.ilike(f"%{crop_name}%"))

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)

    return list(result.scalars().all())


async def update_crop(
    db: AsyncSession,
    crop: Crop,
) -> Crop:
    await db.commit()
    await db.refresh(crop)

    return crop


async def delete_crop(
    db: AsyncSession,
    crop: Crop,
) -> None:
    await db.delete(crop)
    await db.commit()

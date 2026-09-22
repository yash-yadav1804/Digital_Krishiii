from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.land_listing import LandListing


class LandListingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, listing: LandListing) -> LandListing:
        self.db.add(listing)
        await self.db.commit()
        await self.db.refresh(listing)
        return listing

    async def get_by_id(self, listing_id: UUID) -> LandListing | None:
        result = await self.db.execute(
            select(LandListing).where(LandListing.id == listing_id)
        )
        return result.scalar_one_or_none()

    async def get_open(self) -> list[LandListing]:
        result = await self.db.execute(
            select(LandListing)
            .where(LandListing.status == "OPEN")
            .order_by(LandListing.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_farmer(self, farmer_id: UUID) -> list[LandListing]:
        result = await self.db.execute(
            select(LandListing)
            .where(LandListing.farmer_id == farmer_id)
            .order_by(LandListing.created_at.desc())
        )
        return list(result.scalars().all())

    async def update(self, listing: LandListing) -> LandListing:
        await self.db.commit()
        await self.db.refresh(listing)
        return listing

    async def delete(self, listing: LandListing) -> None:
        await self.db.delete(listing)
        await self.db.commit()

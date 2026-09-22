from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.land_listing import LandListing
from app.repositories.land_listing_repository import LandListingRepository
from app.repositories.land_repository import get_land_by_id
from app.schemas.land_listing import LandListingCreate, LandListingUpdate


class LandListingService:
    def __init__(self, db: AsyncSession):
        self.repository = LandListingRepository(db)

    async def create(
        self,
        *,
        farmer_id: UUID,
        data: LandListingCreate,
    ) -> LandListing:
        land = await get_land_by_id(db=db, land_id=data.land_id)
        if land is None or land.farmer_id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land not found",
            )

        listing = LandListing(
            farmer_id=farmer_id,
            land_id=data.land_id,
            listing_type=data.listing_type.value,
            rate_per_acre=data.rate_per_acre,
            min_duration_months=data.min_duration_months,
            max_duration_months=data.max_duration_months,
            description=data.description,
            status="OPEN",
        )
        return await self.repository.create(listing)

    async def get_open(self) -> list[LandListing]:
        return await self.repository.get_open()

    async def get_mine(self, farmer_id: UUID) -> list[LandListing]:
        return await self.repository.get_by_farmer(farmer_id)

    async def get_owned(self, listing_id: UUID, farmer_id: UUID) -> LandListing:
        listing = await self.repository.get_by_id(listing_id)
        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land listing not found",
            )
        if listing.farmer_id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage this land listing",
            )
        return listing

    async def update(
        self,
        *,
        listing_id: UUID,
        farmer_id: UUID,
        data: LandListingUpdate,
    ) -> LandListing:
        listing = await self.get_owned(listing_id, farmer_id)
        changes = data.model_dump(exclude_unset=True)
        if "listing_type" in changes:
            changes["listing_type"] = changes["listing_type"].value
        if "status" in changes:
            changes["status"] = changes["status"].value

        min_duration = changes.get("min_duration_months", listing.min_duration_months)
        max_duration = changes.get("max_duration_months", listing.max_duration_months)
        if max_duration < min_duration:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Maximum duration must be at least the minimum duration",
            )

        for field, value in changes.items():
            setattr(listing, field, value)
        return await self.repository.update(listing)

    async def delete(self, *, listing_id: UUID, farmer_id: UUID) -> None:
        listing = await self.get_owned(listing_id, farmer_id)
        await self.repository.delete(listing)

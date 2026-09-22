from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.land_listing import (
    LandListingCreate,
    LandListingResponse,
    LandListingUpdate,
)
from app.services.land_listing_service import LandListingService

router = APIRouter(prefix="/land-listings", tags=["Land Listings"])


def get_listing_service(db: AsyncSession = Depends(get_db)) -> LandListingService:
    return LandListingService(db)


@router.post("", response_model=LandListingResponse, status_code=status.HTTP_201_CREATED)
async def create_land_listing(
    data: LandListingCreate,
    current_user: User = Depends(require_role("farmer")),
    service: LandListingService = Depends(get_listing_service),
):
    return await service.create(farmer_id=current_user.id, data=data)


@router.get("/mine", response_model=list[LandListingResponse])
async def get_my_land_listings(
    current_user: User = Depends(require_role("farmer")),
    service: LandListingService = Depends(get_listing_service),
):
    return await service.get_mine(current_user.id)


@router.get("/open", response_model=list[LandListingResponse])
async def get_open_land_listings(
    current_user: User = Depends(get_current_user),
    service: LandListingService = Depends(get_listing_service),
):
    return await service.get_open()


@router.patch("/{listing_id}", response_model=LandListingResponse)
async def update_land_listing(
    listing_id: UUID,
    data: LandListingUpdate,
    current_user: User = Depends(require_role("farmer")),
    service: LandListingService = Depends(get_listing_service),
):
    return await service.update(
        listing_id=listing_id,
        farmer_id=current_user.id,
        data=data,
    )


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_land_listing(
    listing_id: UUID,
    current_user: User = Depends(require_role("farmer")),
    service: LandListingService = Depends(get_listing_service),
):
    await service.delete(listing_id=listing_id, farmer_id=current_user.id)

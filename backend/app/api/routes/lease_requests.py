from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.lease_request import (
    LeaseRequestCreate,
    LeaseRequestResponse,
    LeaseRequestUpdate,
)
from app.services.lease_request_service import LeaseRequestService

router = APIRouter(prefix="/lease-requests", tags=["Lease Requests"])


def get_request_service(db: AsyncSession = Depends(get_db)) -> LeaseRequestService:
    return LeaseRequestService(db)


@router.post("", response_model=LeaseRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_lease_request(
    data: LeaseRequestCreate,
    current_user: User = Depends(require_role("buyer")),
    service: LeaseRequestService = Depends(get_request_service),
):
    return await service.create(buyer_id=current_user.id, data=data)


@router.get("/mine", response_model=list[LeaseRequestResponse])
async def get_my_lease_requests(
    current_user: User = Depends(require_role("buyer")),
    service: LeaseRequestService = Depends(get_request_service),
):
    return await service.get_mine(current_user.id)


@router.get("/listing/{listing_id}", response_model=list[LeaseRequestResponse])
async def get_listing_requests(
    listing_id: UUID,
    current_user: User = Depends(require_role("farmer")),
    service: LeaseRequestService = Depends(get_request_service),
):
    return await service.get_for_listing(listing_id=listing_id, farmer_id=current_user.id)


@router.patch("/{request_id}", response_model=LeaseRequestResponse)
async def update_lease_request(
    request_id: UUID,
    data: LeaseRequestUpdate,
    current_user: User = Depends(require_role("farmer")),
    service: LeaseRequestService = Depends(get_request_service),
):
    return await service.update(
        request_id=request_id,
        farmer_id=current_user.id,
        data=data,
    )

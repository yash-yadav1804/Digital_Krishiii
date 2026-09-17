from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.land import LandCreate, LandResponse, LandUpdate
from app.services.land_service import LandService

router = APIRouter(
    prefix="/lands",
    tags=["Lands"],
)


def get_land_service(
    session: AsyncSession = Depends(get_db),
) -> LandService:
    return LandService(session)


@router.post(
    "/",
    response_model=LandResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_land(
    data: LandCreate,
    current_user: User = Depends(get_current_user),
    land_service: LandService = Depends(get_land_service),
):
    return await land_service.create_land(
        farmer_id=current_user.id,
        data=data,
    )


@router.get(
    "/",
    response_model=list[LandResponse],
)
async def get_my_lands(
    current_user: User = Depends(get_current_user),
    land_service: LandService = Depends(get_land_service),
):
    return await land_service.get_farmer_lands(
        farmer_id=current_user.id,
    )


@router.get(
    "/{land_id}",
    response_model=LandResponse,
)
async def get_land(
    land_id: UUID,
    current_user: User = Depends(get_current_user),
    land_service: LandService = Depends(get_land_service),
):
    return await land_service.get_land(
        farmer_id=current_user.id,
        land_id=land_id,
    )


@router.put(
    "/{land_id}",
    response_model=LandResponse,
)
async def update_land(
    land_id: UUID,
    data: LandUpdate,
    current_user: User = Depends(get_current_user),
    land_service: LandService = Depends(get_land_service),
):
    return await land_service.update_land(
        farmer_id=current_user.id,
        land_id=land_id,
        data=data,
    )


@router.delete(
    "/{land_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_land(
    land_id: UUID,
    current_user: User = Depends(get_current_user),
    land_service: LandService = Depends(get_land_service),
):
    await land_service.delete_land(
        farmer_id=current_user.id,
        land_id=land_id,
    )

    return None

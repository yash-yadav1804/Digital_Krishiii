from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.crop import CropCreate, CropResponse, CropUpdate
from app.services.crop_service import (
    create_crop,
    delete_crop,
    get_crop,
    get_farmer_crops,
    update_crop,
)

router = APIRouter(
    prefix="/api/v1/crops",
    tags=["Crops"],
)


@router.post(
    "",
    response_model=CropResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_crop_route(
    data: CropCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_crop(
        db=db,
        farmer_id=current_user.id,
        data=data,
    )


@router.get(
    "",
    response_model=list[CropResponse],
)
async def list_crops_route(
    season: str | None = Query(
        default=None,
        description="Filter crops by season",
    ),
    crop_name: str | None = Query(
        default=None,
        description="Search crops by name",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of records to skip",
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Maximum number of records to return",
    ),
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    return await get_farmer_crops(
        db=db,
        farmer_id=current_user.id,
        season=season,
        crop_name=crop_name,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{crop_id}",
    response_model=CropResponse,
)
async def get_crop_route(
    crop_id: UUID,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    return await get_crop(
        db=db,
        farmer_id=current_user.id,
        crop_id=crop_id,
    )


@router.patch(
    "/{crop_id}",
    response_model=CropResponse,
)
async def update_crop_route(
    crop_id: UUID,
    data: CropUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await update_crop(
        db=db,
        farmer_id=current_user.id,
        crop_id=crop_id,
        data=data,
    )


@router.delete(
    "/{crop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_crop_route(
    crop_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await delete_crop(
        db=db,
        farmer_id=current_user.id,
        crop_id=crop_id,
    )

    return None

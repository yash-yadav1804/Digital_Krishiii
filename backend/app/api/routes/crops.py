from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_farmer_crops(
        db=db,
        farmer_id=current_user.id,
    )


@router.get(
    "/{crop_id}",
    response_model=CropResponse,
)
async def get_crop_route(
    crop_id: UUID,
    current_user: User = Depends(get_current_user),
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

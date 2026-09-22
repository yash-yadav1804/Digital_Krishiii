from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_role
from app.db.models.farmer_profile import FarmerProfile
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.farmer_profile import (
    FarmerProfileCreate,
    FarmerProfileResponse,
    FarmerProfileUpdate,
)

router = APIRouter(
    prefix="/farmer-profiles",
    tags=["Farmer Profiles"],
)


async def get_profile_by_user_id(
    db: AsyncSession,
    user_id: UUID,
) -> FarmerProfile:
    result = await db.execute(
        select(FarmerProfile).where(FarmerProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )
    return profile


@router.post(
    "",
    response_model=FarmerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_farmer_profile(
    profile_data: FarmerProfileCreate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    if profile_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create your own farmer profile",
        )

    result = await db.execute(
        select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farmer profile already exists for this user",
        )

    profile = FarmerProfile(
        user_id=current_user.id,
        full_name=profile_data.full_name,
        phone_number=profile_data.phone_number,
        village=profile_data.village,
        district=profile_data.district,
        state=profile_data.state,
        land_details=profile_data.land_details,
        image_url=profile_data.image_url,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get(
    "/me",
    response_model=FarmerProfileResponse,
)
async def get_my_farmer_profile(
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    return await get_profile_by_user_id(db, current_user.id)


@router.put(
    "/me",
    response_model=FarmerProfileResponse,
)
async def update_my_farmer_profile(
    profile_data: FarmerProfileUpdate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    profile = await get_profile_by_user_id(db, current_user.id)
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get(
    "",
    response_model=list[FarmerProfileResponse],
)
async def get_all_farmer_profiles(
    current_user: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FarmerProfile))
    return list(result.scalars().all())


@router.get(
    "/{user_id}",
    response_model=FarmerProfileResponse,
)
async def get_farmer_profile(
    user_id: UUID,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own farmer profile",
        )
    return await get_profile_by_user_id(db, user_id)


@router.put(
    "/{user_id}",
    response_model=FarmerProfileResponse,
)
async def update_farmer_profile(
    user_id: UUID,
    profile_data: FarmerProfileUpdate,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own farmer profile",
        )

    profile = await get_profile_by_user_id(db, user_id)
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_farmer_profile(
    user_id: UUID,
    current_user: User = Depends(require_role("farmer")),
    db: AsyncSession = Depends(get_db),
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own farmer profile",
        )

    profile = await get_profile_by_user_id(db, user_id)
    await db.delete(profile)
    await db.commit()

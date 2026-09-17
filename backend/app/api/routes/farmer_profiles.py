from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
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


@router.get("/health")
async def farmer_profile_health():
    return {"message": "Farmer profile router is working"}


@router.post(
    "",
    response_model=FarmerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_farmer_profile(
    profile_data: FarmerProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
):
    # A user can create only their own profile.
    if profile_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create your own farmer profile",
        )

    result = await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))

    existing_profile = result.scalar_one_or_none()

    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Farmer profile already exists for this user",
        )

    new_profile = FarmerProfile(
        user_id=current_user.id,
        full_name=profile_data.full_name,
        phone_number=profile_data.phone_number,
        village=profile_data.village,
        district=profile_data.district,
        state=profile_data.state,
        land_details=profile_data.land_details,
    )

    db.add(new_profile)

    await db.commit()
    await db.refresh(new_profile)

    return new_profile


@router.get(
    "/",
    response_model=list[FarmerProfileResponse],
)
async def get_all_farmer_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(require_role("admin")),
    ] = None,
):
    result = await db.execute(select(FarmerProfile))

    profiles = result.scalars().all()

    return profiles


@router.get(
    "/{user_id}",
    response_model=FarmerProfileResponse,
)
async def get_farmer_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
):
    # A user can view only their own profile.
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own farmer profile",
        )

    result = await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == user_id))

    profile = result.scalar_one_or_none()

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    return profile


@router.put(
    "/{user_id}",
    response_model=FarmerProfileResponse,
)
async def update_farmer_profile(
    user_id: UUID,
    profile_data: FarmerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
):
    # A user can update only their own profile.
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own farmer profile",
        )

    result = await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == user_id))

    profile = result.scalar_one_or_none()

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)

    return profile


@router.delete(
    "/{user_id}",
)
async def delete_farmer_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
):
    # A user can delete only their own profile.
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own farmer profile",
        )

    result = await db.execute(select(FarmerProfile).where(FarmerProfile.user_id == user_id))

    profile = result.scalar_one_or_none()

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Farmer profile not found",
        )

    await db.delete(profile)
    await db.commit()

    return {"message": "Farmer profile deleted successfully"}

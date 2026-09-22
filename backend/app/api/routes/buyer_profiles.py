from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.buyer_profile import BuyerProfile
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.buyer_profile import (
    BuyerProfileCreate,
    BuyerProfileResponse,
    BuyerProfileUpdate,
)

router = APIRouter(
    prefix="/buyer-profiles",
    tags=["Buyer Profiles"],
)


@router.post(
    "",
    response_model=BuyerProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_buyer_profile(
    data: BuyerProfileCreate,
    current_user: User = Depends(require_role("buyer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BuyerProfile).where(BuyerProfile.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Buyer profile already exists",
        )

    profile = BuyerProfile(
        user_id=current_user.id,
        full_name=data.full_name,
        company_name=data.company_name,
        phone_number=data.phone_number,
        city=data.city,
        state=data.state,
        business_description=data.business_description,
        image_url=data.image_url,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get(
    "/me",
    response_model=BuyerProfileResponse,
)
async def get_my_buyer_profile(
    current_user: User = Depends(require_role("buyer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BuyerProfile).where(BuyerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer profile not found",
        )
    return profile


@router.put(
    "/me",
    response_model=BuyerProfileResponse,
)
async def update_my_buyer_profile(
    data: BuyerProfileUpdate,
    current_user: User = Depends(require_role("buyer")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BuyerProfile).where(BuyerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buyer profile not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get(
    "",
    response_model=list[BuyerProfileResponse],
)
async def list_buyer_profiles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Public listing — any authenticated user can browse buyer profiles."""
    result = await db.execute(select(BuyerProfile))
    return result.scalars().all()

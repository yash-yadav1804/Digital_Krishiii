from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user, require_role
from app.db.models import User
from app.schemas.auth import UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),  # noqa: B008
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.get("/farmer-area")
async def get_farmer_area(
    current_user: User = Depends(require_role("farmer")),  # noqa: B008
) -> dict[str, str]:
    return {
        "message": "Welcome to the farmer area",
        "user_id": str(current_user.id),
    }

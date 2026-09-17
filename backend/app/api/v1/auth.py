from fastapi import APIRouter, Depends, status
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.jwt import create_access_token
from app.db.session import get_db_session
from app.schemas.auth import RegisterRequest, TokenResponse, UserResponse
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> UserResponse:
    user = await UserService(session).register_user(
        email=str(payload.email),
        password=payload.password,
        role_name=payload.role,
    )

    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
async def login_user(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> TokenResponse:
    user = await UserService(session).authenticate_user(
        email=str(payload.email),
        password=payload.password,
    )

    access_token = create_access_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )

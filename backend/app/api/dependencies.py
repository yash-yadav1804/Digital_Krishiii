from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.jwt import decode_access_token
from app.db.models import User
from app.db.session import get_db_session
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),  # noqa: B008
    session: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        user_id = decode_access_token(token)
    except ValueError as exc:
        raise credentials_exception from exc

    user = await UserRepository(session).get_by_id(user_id)

    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_role(role_name: str) -> Callable:
    async def role_checker(
        current_user: Annotated[
            User,
            Depends(get_current_user),
        ],
        session: Annotated[
            AsyncSession,
            Depends(get_db_session),
        ],
    ) -> User:
        has_role = await UserService(session).user_has_role(
            user_id=current_user.id,
            role_name=role_name,
        )

        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_user

    return role_checker

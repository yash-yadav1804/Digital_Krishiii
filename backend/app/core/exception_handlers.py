from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions.auth import InvalidCredentialsError
from app.core.exceptions.user import UserAlreadyExistsError


async def user_already_exists_handler(
    request: Request,
    exc: UserAlreadyExistsError,
) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={
            "detail": str(exc),
        },
    )


async def invalid_credentials_handler(
    request: Request,
    exc: InvalidCredentialsError,
) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid email or password"},
        headers={"WWW-Authenticate": "Bearer"},
    )

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.users import router as users_router
from app.api.v1.admin import router as admin_router

from app.core.config import settings
from app.core.exception_handlers import (
    invalid_credentials_handler,
    user_already_exists_handler,
)
from app.core.exceptions.auth import InvalidCredentialsError
from app.core.exceptions.user import UserAlreadyExistsError
from app.db.seed import seed_default_roles
from app.db.session import async_session_factory


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with async_session_factory() as session:
        await seed_default_roles(session)

    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)


app.add_exception_handler(
    UserAlreadyExistsError,
    user_already_exists_handler,
)

app.add_exception_handler(
    InvalidCredentialsError,
    invalid_credentials_handler,
)


app.include_router(auth_router, prefix="/api/v1")
app.include_router(
    users_router,
    prefix="/api/v1",
)

app.include_router(admin_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

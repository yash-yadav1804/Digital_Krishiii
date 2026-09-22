from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes.buyer_profiles import router as buyer_profiles_router
from app.api.routes.contract_bids import router as contract_bids_router
from app.api.routes.contracts import router as contracts_router
from app.api.routes.contract_negotiations import router as contract_negotiations_router
from app.api.routes.crops import router as crops_router
from app.api.routes.equipment import router as equipment_router
from app.api.routes.equipment_requests import router as equipment_requests_router
from app.api.routes.farmer_profiles import router as farmer_profiles_router
from app.api.routes.land_listings import router as land_listings_router
from app.api.routes.lands import router as lands_router
from app.api.routes.lease_requests import router as lease_requests_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.reviews import router as reviews_router
from app.api.routes.support import router as support_router

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.uploads import UPLOAD_DIR, router as uploads_router

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


# Static files
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
app.add_exception_handler(
    UserAlreadyExistsError,
    user_already_exists_handler,
)

app.add_exception_handler(
    InvalidCredentialsError,
    invalid_credentials_handler,
)


# API v1 routes
app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    users_router,
    prefix="/api/v1",
)

app.include_router(
    admin_router,
    prefix="/api/v1",
)

app.include_router(
    uploads_router,
    prefix="/api/v1",
)


# Application routes
app.include_router(farmer_profiles_router)
app.include_router(lands_router)
app.include_router(crops_router)
app.include_router(contract_bids_router)
app.include_router(contracts_router)
app.include_router(contract_negotiations_router)
app.include_router(buyer_profiles_router)
app.include_router(notifications_router)
app.include_router(land_listings_router)
app.include_router(lease_requests_router)
app.include_router(equipment_router)
app.include_router(equipment_requests_router)
app.include_router(reviews_router)
app.include_router(support_router)


# Health check endpoint
@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


# Root endpoint
@app.get("/")
async def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")

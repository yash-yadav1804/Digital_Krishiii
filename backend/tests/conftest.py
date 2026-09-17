import asyncio
import sys
import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.db.session import async_session_factory

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@pytest_asyncio.fixture
async def db_session():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as async_client:
        yield async_client


@pytest_asyncio.fixture
async def auth_headers(
    client: AsyncClient,
) -> dict[str, str]:
    """
    Creates and logs in a farmer user.
    """

    email = f"farmer-{uuid.uuid4()}@example.com"
    password = "TestPassword123!"

    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "farmer",
        },
    )

    assert register_response.status_code in (200, 201), (
        register_response.status_code,
        register_response.text,
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200, (
        login_response.status_code,
        login_response.text,
    )

    token_data = login_response.json()
    token = token_data.get("access_token")

    assert token is not None, token_data

    return {
        "Authorization": f"Bearer {token}",
    }


@pytest_asyncio.fixture
async def buyer_headers(
    client: AsyncClient,
) -> dict[str, str]:
    """
    Creates and logs in a buyer user.
    """

    email = f"buyer-{uuid.uuid4()}@example.com"
    password = "TestPassword123!"

    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "role": "buyer",
        },
    )

    assert register_response.status_code in (200, 201), (
        register_response.status_code,
        register_response.text,
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200, (
        login_response.status_code,
        login_response.text,
    )

    token_data = login_response.json()
    token = token_data.get("access_token")

    assert token is not None, token_data

    return {
        "Authorization": f"Bearer {token}",
    }

import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_login_with_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code in (401, 403)


@pytest.mark.anyio
async def test_login_with_missing_fields(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
        },
    )

    assert response.status_code == 422

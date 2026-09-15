import uuid

import pytest
from httpx import AsyncClient

from app.services.user_service import UserService


async def create_user(
    client: AsyncClient,
    db_session,
    email: str,
    password: str = "StrongPassword123!",
):
    service = UserService(db_session)

    user = await service.register_user(
        email=email,
        password=password,
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    return {
        "id": user.id,
        "token": login_response.json()["access_token"],
        "email": email,
        "password": password,
    }


async def create_admin(
    client: AsyncClient,
    db_session,
):
    admin = await create_user(
        client=client,
        db_session=db_session,
        email=f"admin-{uuid.uuid4()}@example.com",
    )

    service = UserService(db_session)

    await service.assign_role_to_user(
        user_id=admin["id"],
        role_name="admin",
    )

    return admin


@pytest.mark.anyio
async def test_admin_cannot_assign_role_to_nonexistent_user(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": admin["email"],
            "password": admin["password"],
        },
    )

    token = login_response.json()["access_token"]
    missing_user_id = uuid.uuid4()

    response = await client.post(
        f"/api/v1/admin/users/{missing_user_id}/roles/contractor",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.anyio
async def test_admin_cannot_remove_role_from_nonexistent_user(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": admin["email"],
            "password": admin["password"],
        },
    )

    token = login_response.json()["access_token"]
    missing_user_id = uuid.uuid4()

    response = await client.delete(
        f"/api/v1/admin/users/{missing_user_id}/roles/contractor",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

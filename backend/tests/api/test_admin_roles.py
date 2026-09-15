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
async def test_admin_can_assign_role_to_user(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    target = await create_user(
        client=client,
        db_session=db_session,
        email=f"role-target-{uuid.uuid4()}@example.com",
    )

    response = await client.post(
        f"/api/v1/admin/users/{target['id']}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Role assigned successfully"
    assert data["user_id"] == str(target["id"])
    assert data["role"] == "contractor"


@pytest.mark.anyio
async def test_admin_can_remove_role_from_user(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    target = await create_user(
        client=client,
        db_session=db_session,
        email=f"remove-role-{uuid.uuid4()}@example.com",
    )

    service = UserService(db_session)

    await service.assign_role_to_user(
        user_id=target["id"],
        role_name="contractor",
    )

    response = await client.delete(
        f"/api/v1/admin/users/{target['id']}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Role removed successfully"
    assert data["user_id"] == str(target["id"])
    assert data["role"] == "contractor"


@pytest.mark.anyio
async def test_admin_cannot_assign_duplicate_role(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    target = await create_user(
        client=client,
        db_session=db_session,
        email=f"duplicate-role-{uuid.uuid4()}@example.com",
    )

    service = UserService(db_session)

    await service.assign_role_to_user(
        user_id=target["id"],
        role_name="contractor",
    )

    response = await client.post(
        f"/api/v1/admin/users/{target['id']}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code in (400, 409)


@pytest.mark.anyio
async def test_admin_cannot_remove_role_user_does_not_have(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    target = await create_user(
        client=client,
        db_session=db_session,
        email=f"missing-role-{uuid.uuid4()}@example.com",
    )

    response = await client.delete(
        f"/api/v1/admin/users/{target['id']}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code in (400, 404)


@pytest.mark.anyio
async def test_admin_can_assign_and_remove_multiple_roles(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    target = await create_user(
        client=client,
        db_session=db_session,
        email=f"multiple-roles-{uuid.uuid4()}@example.com",
    )

    service = UserService(db_session)

    await service.assign_role_to_user(
        user_id=target["id"],
        role_name="contractor",
    )

    response = await client.get(
        "/api/v1/admin/users",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    users = response.json()

    target_user = next(user for user in users if user["id"] == str(target["id"]))

    assert "contractor" in target_user["roles"]
    assert "farmer" in target_user["roles"]

    remove_response = await client.delete(
        f"/api/v1/admin/users/{target['id']}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert remove_response.status_code == 200

    response = await client.get(
        "/api/v1/admin/users",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    users = response.json()

    target_user = next(user for user in users if user["id"] == str(target["id"]))

    assert "contractor" not in target_user["roles"]
    assert "farmer" in target_user["roles"]

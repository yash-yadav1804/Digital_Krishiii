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

    missing_user_id = uuid.uuid4()

    response = await client.post(
        f"/api/v1/admin/users/{missing_user_id}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
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

    missing_user_id = uuid.uuid4()

    response = await client.delete(
        f"/api/v1/admin/users/{missing_user_id}/roles/contractor",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.anyio
async def test_admin_can_deactivate_user(
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
        email=f"target-status-{uuid.uuid4()}@example.com",
    )

    response = await client.patch(
        f"/api/v1/admin/users/{target['id']}/status",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "user status updated"
    assert data["user_id"] == str(target["id"])
    assert data["is_active"] is False


@pytest.mark.anyio
async def test_admin_can_activate_user(
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
        email=f"target-activate-{uuid.uuid4()}@example.com",
    )

    deactivate_response = await client.patch(
        f"/api/v1/admin/users/{target['id']}/status",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
        json={
            "is_active": False,
        },
    )

    assert deactivate_response.status_code == 200

    activate_response = await client.patch(
        f"/api/v1/admin/users/{target['id']}/status",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
        json={
            "is_active": True,
        },
    )

    assert activate_response.status_code == 200
    assert activate_response.json()["is_active"] is True


@pytest.mark.anyio
async def test_admin_cannot_update_own_status(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    response = await client.patch(
        f"/api/v1/admin/users/{admin['id']}/status",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == ("An admin cannot deactivate their own account")


@pytest.mark.anyio
async def test_admin_cannot_update_nonexistent_user_status(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    missing_user_id = uuid.uuid4()

    response = await client.patch(
        f"/api/v1/admin/users/{missing_user_id}/status",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
        json={
            "is_active": False,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.anyio
async def test_admin_can_list_users(
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
        email=f"list-user-{uuid.uuid4()}@example.com",
    )

    response = await client.get(
        "/api/v1/admin/users",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    users = response.json()

    assert isinstance(users, list)
    assert len(users) >= 2

    user_ids = [user["id"] for user in users]

    assert str(admin["id"]) in user_ids
    assert str(target["id"]) in user_ids


@pytest.mark.anyio
async def test_admin_user_list_contains_expected_fields(
    client: AsyncClient,
    db_session,
):
    admin = await create_admin(
        client=client,
        db_session=db_session,
    )

    response = await client.get(
        "/api/v1/admin/users",
        headers={
            "Authorization": f"Bearer {admin['token']}",
        },
    )

    assert response.status_code == 200

    users = response.json()

    assert len(users) >= 1

    user = users[0]

    assert "id" in user
    assert "email" in user
    assert "is_active" in user
    assert "roles" in user

    assert isinstance(user["roles"], list)


@pytest.mark.anyio
async def test_non_admin_cannot_list_users(
    client: AsyncClient,
    db_session,
):
    user = await create_user(
        client=client,
        db_session=db_session,
        email=f"normal-user-{uuid.uuid4()}@example.com",
    )

    response = await client.get(
        "/api/v1/admin/users",
        headers={
            "Authorization": f"Bearer {user['token']}",
        },
    )

    assert response.status_code == 403


@pytest.mark.anyio
async def test_unauthenticated_user_cannot_list_users(
    client: AsyncClient,
):
    response = await client.get("/api/v1/admin/users")

    assert response.status_code in (401, 403)

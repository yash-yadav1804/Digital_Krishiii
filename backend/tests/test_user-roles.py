import uuid

import pytest

from app.services.user_service import UserService


@pytest.mark.asyncio
async def test_register_user_assigns_farmer_role(db_session):
    service = UserService(db_session)

    email = f"role-test-farmer-{uuid.uuid4()}@example.com"

    user = await service.register_user(
        email=email,
        password="StrongPassword123!",
    )

    has_farmer_role = await service.user_has_role(
        user_id=user.id,
        role_name="farmer",
    )

    assert has_farmer_role is True


@pytest.mark.asyncio
async def test_registered_user_does_not_have_contractor_role(db_session):
    service = UserService(db_session)

    email = f"role-test-contractor-{uuid.uuid4()}@example.com"

    user = await service.register_user(
        email=email,
        password="StrongPassword123!",
    )

    has_contractor_role = await service.user_has_role(
        user_id=user.id,
        role_name="contractor",
    )

    assert has_contractor_role is False


@pytest.mark.asyncio
async def test_registered_user_has_no_admin_role(db_session):
    service = UserService(db_session)

    email = f"role-test-admin-{uuid.uuid4()}@example.com"

    user = await service.register_user(
        email=email,
        password="StrongPassword123!",
    )

    has_admin_role = await service.user_has_role(
        user_id=user.id,
        role_name="admin",
    )

    assert has_admin_role is False

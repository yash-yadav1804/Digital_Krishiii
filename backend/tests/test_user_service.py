import uuid

import pytest
from sqlalchemy import delete

from app.core.exceptions.user import UserAlreadyExistsError
from app.core.security.password import verify_password
from app.db.models import User
from app.services.user_service import UserService


@pytest.mark.asyncio
async def test_register_user(db_session):
    service = UserService(db_session)

    email = f"service-{uuid.uuid4()}@example.com"
    password = "StrongPassword@123"

    user = await service.register_user(
        email=email,
        password=password,
    )

    assert user.email == email
    assert user.password_hash != password
    assert verify_password(password, user.password_hash) is True

    await db_session.execute(delete(User).where(User.id == user.id))
    await db_session.commit()


@pytest.mark.asyncio
async def test_register_user_rejects_duplicate_email(db_session):
    service = UserService(db_session)

    email = f"duplicate-{uuid.uuid4()}@example.com"

    await service.register_user(
        email=email,
        password="StrongPassword@123",
    )

    with pytest.raises(
        UserAlreadyExistsError,
        match="Email is already registered",
    ):
        await service.register_user(
            email=email.upper(),
            password="AnotherPassword@123",
        )

    await db_session.execute(delete(User).where(User.email == email))
    await db_session.commit()

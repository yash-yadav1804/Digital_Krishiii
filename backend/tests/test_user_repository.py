import uuid

import pytest
from sqlalchemy import delete

from app.db.models import User
from app.repositories.user_repository import UserRepository


@pytest.mark.asyncio
async def test_user_repository_create_and_find(db_session):
    repository = UserRepository(db_session)

    email = f"repository-{uuid.uuid4()}@example.com"

    created_user = await repository.create(
        email=email,
        password_hash="hashed-password",
    )

    await db_session.commit()

    assert created_user.id is not None
    assert created_user.email == email

    found_user = await repository.get_by_email(email)

    assert found_user is not None
    assert found_user.id == created_user.id

    await db_session.execute(delete(User).where(User.id == created_user.id))
    await db_session.commit()

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import User
from app.db.models.role import Role
from app.db.models.user_role import UserRole


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self.session.execute(
            select(User).options(selectinload(User.roles)).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(
        self,
        email: str,
        password_hash: str,
    ) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            is_active=True,
        )

        self.session.add(user)
        await self.session.flush()

        return user

    async def get_all(self) -> list[User]:
        result = await self.session.execute(
            select(User).options(selectinload(User.roles)).order_by(User.email.asc())
        )
        return list(result.scalars().all())

    async def assign_role(
        self,
        user_id: UUID,
        role_name: str,
    ) -> bool:
        role_result = await self.session.execute(
            select(Role).where(Role.name == role_name)
        )
        role = role_result.scalar_one_or_none()

        if role is None:
            return False

        existing_result = await self.session.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
            )
        )

        if existing_result.scalar_one_or_none() is not None:
            return False

        self.session.add(
            UserRole(
                user_id=user_id,
                role_id=role.id,
            )
        )

        await self.session.commit()

        return True

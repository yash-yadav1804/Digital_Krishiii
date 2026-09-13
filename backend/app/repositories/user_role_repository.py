import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.role import Role
from app.db.models.user_role import UserRole


class UserRoleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def assign_role(
        self,
        user_id: uuid.UUID,
        role_id: int,
    ) -> UserRole:
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
        )

        self.session.add(user_role)
        await self.session.flush()
        await self.session.refresh(user_role)

        return user_role

    async def user_has_role(
        self,
        user_id,
        role_name: str,
    ) -> bool:
        result = await self.session.execute(
            select(UserRole)
            .join(Role, Role.id == UserRole.role_id)
            .where(
                UserRole.user_id == user_id,
                Role.name == role_name,
            )
        )

        return result.scalar_one_or_none() is not None

    async def get_user_role_names(
        self,
        user_id: uuid.UUID,
    ) -> list[str]:
        result = await self.session.execute(
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
            .order_by(Role.name)
        )

        return list(result.scalars().all())

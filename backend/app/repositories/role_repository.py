from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.role import Role


class RoleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_name(self, name: str) -> Role | None:
        result = await self.session.execute(select(Role).where(Role.name == name))

        return result.scalar_one_or_none()

    async def list_all(self) -> list[Role]:
        result = await self.session.execute(select(Role).order_by(Role.name))

        return list(result.scalars().all())

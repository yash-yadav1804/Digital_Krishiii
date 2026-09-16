from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.land import Land


class LandRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, land: Land) -> Land:
        self.session.add(land)
        await self.session.commit()
        await self.session.refresh(land)

        return land

    async def get_by_id(
        self,
        land_id: UUID,
    ) -> Land | None:
        result = await self.session.execute(select(Land).where(Land.id == land_id))

        return result.scalar_one_or_none()

    async def get_by_farmer_id(
        self,
        farmer_id: UUID,
    ) -> list[Land]:
        result = await self.session.execute(
            select(Land)
            .where(Land.farmer_id == farmer_id)
            .order_by(Land.created_at.desc())
        )

        return list(result.scalars().all())

    async def update(self, land: Land) -> Land:
        await self.session.commit()
        await self.session.refresh(land)

        return land

    async def delete(self, land: Land) -> None:
        await self.session.delete(land)
        await self.session.commit()


async def get_land_by_id(
    db: AsyncSession,
    land_id: UUID,
) -> Land | None:
    result = await db.execute(select(Land).where(Land.id == land_id))

    return result.scalar_one_or_none()

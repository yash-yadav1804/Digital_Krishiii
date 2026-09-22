from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.review import Review


class ReviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, review: Review) -> Review:
        self.db.add(review)
        await self.db.commit()
        await self.db.refresh(review)
        return review

    async def get_by_id(self, review_id: UUID) -> Review | None:
        result = await self.db.execute(select(Review).where(Review.id == review_id))
        return result.scalar_one_or_none()

    async def get_for_user(self, reviewee_id: UUID) -> list[Review]:
        result = await self.db.execute(
            select(Review)
            .where(Review.reviewee_id == reviewee_id)
            .order_by(Review.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_reviewer_and_contract(
        self, reviewer_id: UUID, contract_id: UUID
    ) -> Review | None:
        result = await self.db.execute(
            select(Review).where(
                Review.reviewer_id == reviewer_id, Review.contract_id == contract_id
            )
        )
        return result.scalar_one_or_none()

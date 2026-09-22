from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.review import Review
from app.repositories.contract_repository import get_contract_by_id
from app.repositories.review_repository import ReviewRepository
from app.schemas.review import ReviewCreate
from app.services.notification_service import create_notification


class ReviewService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ReviewRepository(db)

    async def create(
        self,
        *,
        reviewer_id: UUID,
        data: ReviewCreate,
    ) -> Review:
        contract = await get_contract_by_id(self.db, data.contract_id)
        if contract is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found"
            )
        if contract.status != "COMPLETED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reviews can only be written for completed contracts",
            )
        if reviewer_id not in {contract.farmer_id, contract.buyer_id}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only contract participants can write reviews",
            )
        reviewee_id = (
            contract.buyer_id
            if reviewer_id == contract.farmer_id
            else contract.farmer_id
        )
        if reviewee_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot review an unassigned contract",
            )
        if reviewer_id == reviewee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot review yourself",
            )
        existing = await self.repository.get_by_reviewer_and_contract(
            reviewer_id, data.contract_id
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already reviewed this contract",
            )
        review = Review(
            reviewer_id=reviewer_id,
            reviewee_id=reviewee_id,
            contract_id=data.contract_id,
            rating=data.rating,
            comment=data.comment,
        )
        create_notification(
            self.db,
            user_id=reviewee_id,
            title="You received a new review",
            message=f"Someone left a {data.rating}-star review.",
            notification_type="REVIEW_RECEIVED",
            related_id=data.contract_id,
        )
        return await self.repository.create(review)

    async def get_for_user(self, user_id: UUID) -> list[Review]:
        return await self.repository.get_for_user(user_id)

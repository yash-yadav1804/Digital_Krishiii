from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.lease_request import LeaseRequest


class LeaseRequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, request: LeaseRequest) -> LeaseRequest:
        self.db.add(request)
        await self.db.commit()
        await self.db.refresh(request)
        return request

    async def get_by_id(self, request_id: UUID) -> LeaseRequest | None:
        result = await self.db.execute(
            select(LeaseRequest).where(LeaseRequest.id == request_id)
        )
        return result.scalar_one_or_none()

    async def get_by_buyer(self, buyer_id: UUID) -> list[LeaseRequest]:
        result = await self.db.execute(
            select(LeaseRequest)
            .where(LeaseRequest.buyer_id == buyer_id)
            .order_by(LeaseRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_listing(self, listing_id: UUID) -> list[LeaseRequest]:
        result = await self.db.execute(
            select(LeaseRequest)
            .where(LeaseRequest.listing_id == listing_id)
            .order_by(LeaseRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def reject_pending_except(
        self,
        *,
        listing_id: UUID,
        accepted_request_id: UUID,
    ) -> list[LeaseRequest]:
        result = await self.db.execute(
            select(LeaseRequest).where(
                LeaseRequest.listing_id == listing_id,
                LeaseRequest.id != accepted_request_id,
                LeaseRequest.status == "PENDING",
            )
        )
        rejected_requests = list(result.scalars().all())
        for request in rejected_requests:
            request.status = "REJECTED"
        return rejected_requests

    async def update(self, request: LeaseRequest) -> LeaseRequest:
        await self.db.commit()
        await self.db.refresh(request)
        return request

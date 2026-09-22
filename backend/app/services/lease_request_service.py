from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.lease_request import LeaseRequest
from app.repositories.land_listing_repository import LandListingRepository
from app.repositories.lease_request_repository import LeaseRequestRepository
from app.schemas.lease_request import (
    LeaseRequestCreate,
    LeaseRequestStatus,
    LeaseRequestUpdate,
)
from app.services.notification_service import create_notification


class LeaseRequestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.listings = LandListingRepository(db)
        self.requests = LeaseRequestRepository(db)

    async def create(
        self,
        *,
        buyer_id: UUID,
        data: LeaseRequestCreate,
    ) -> LeaseRequest:
        listing = await self.listings.get_by_id(data.listing_id)
        if listing is None or listing.status != "OPEN":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Open land listing not found",
            )
        if listing.farmer_id == buyer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot request your own land listing",
            )

        request = LeaseRequest(
            listing_id=listing.id,
            buyer_id=buyer_id,
            start_date=data.start_date,
            end_date=data.end_date,
            offered_rate_per_acre=data.offered_rate_per_acre,
            message=data.message,
            status="PENDING",
        )
        create_notification(
            self.db,
            user_id=listing.farmer_id,
            title="New lease request",
            message="A buyer submitted a request for your land listing.",
            notification_type="LEASE_REQUEST",
            related_id=listing.id,
        )
        return await self.requests.create(request)

    async def get_mine(self, buyer_id: UUID) -> list[LeaseRequest]:
        return await self.requests.get_by_buyer(buyer_id)

    async def get_for_listing(
        self,
        *,
        listing_id: UUID,
        farmer_id: UUID,
    ) -> list[LeaseRequest]:
        listing = await self.listings.get_by_id(listing_id)
        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land listing not found",
            )
        if listing.farmer_id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view these lease requests",
            )
        return await self.requests.get_by_listing(listing_id)

    async def update(
        self,
        *,
        request_id: UUID,
        farmer_id: UUID,
        data: LeaseRequestUpdate,
    ) -> LeaseRequest:
        request = await self.requests.get_by_id(request_id)
        if request is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lease request not found",
            )
        listing = await self.listings.get_by_id(request.listing_id)
        if listing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Land listing not found",
            )
        if listing.farmer_id != farmer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this lease request",
            )
        if request.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending lease requests can be updated",
            )
        if data.status not in {LeaseRequestStatus.ACCEPTED, LeaseRequestStatus.REJECTED}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be ACCEPTED or REJECTED",
            )

        request.status = data.status.value
        if data.status == LeaseRequestStatus.ACCEPTED:
            listing.status = "LEASED"
            rejected_requests = await self.requests.reject_pending_except(
                listing_id=listing.id,
                accepted_request_id=request.id,
            )
            create_notification(
                self.db,
                user_id=request.buyer_id,
                title="Lease request accepted",
                message="Your request for a land listing was accepted.",
                notification_type="LEASE_REQUEST_ACCEPTED",
                related_id=listing.id,
            )
            for rejected_request in rejected_requests:
                create_notification(
                    self.db,
                    user_id=rejected_request.buyer_id,
                    title="Lease request closed",
                    message="Another lease request was accepted for this land listing.",
                    notification_type="LEASE_REQUEST_REJECTED",
                    related_id=listing.id,
                )
        else:
            create_notification(
                self.db,
                user_id=request.buyer_id,
                title="Lease request rejected",
                message="Your request for a land listing was rejected.",
                notification_type="LEASE_REQUEST_REJECTED",
                related_id=listing.id,
            )

        return await self.requests.update(request)

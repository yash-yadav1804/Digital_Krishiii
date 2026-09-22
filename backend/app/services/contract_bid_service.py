from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract_bid import ContractBid
from app.repositories import contract_bid_repository
from app.repositories.contract_repository import get_contract_by_id
from app.schemas.contract_bid import (
    ContractBidCreate,
    ContractBidStatus,
    ContractBidUpdate,
)
from app.services.notification_service import create_notification


async def create_bid(
    db: AsyncSession,
    buyer_id: UUID,
    data: ContractBidCreate,
) -> ContractBid:
    contract = await get_contract_by_id(
        db=db,
        contract_id=data.contract_id,
    )

    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    if contract.status != "OPEN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bids can only be placed on open contracts",
        )

    if contract.farmer_id == buyer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot bid on your own contract",
        )

    if data.offered_quantity > contract.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offered quantity cannot exceed contract quantity",
        )

    bid = ContractBid(
        contract_id=data.contract_id,
        buyer_id=buyer_id,
        offered_quantity=data.offered_quantity,
        offered_price_per_unit=data.offered_price_per_unit,
        message=data.message,
        image_url=data.image_url,
        status="PENDING",
    )

    create_notification(
        db,
        user_id=contract.farmer_id,
        title="New contract bid",
        message=f"A buyer placed a bid on '{contract.title}'.",
        notification_type="CONTRACT_BID",
        related_id=contract.id,
    )

    return await contract_bid_repository.create_bid(
        db=db,
        bid=bid,
    )


async def get_buyer_bids(
    db: AsyncSession,
    buyer_id: UUID,
) -> list[ContractBid]:
    return await contract_bid_repository.get_bids_by_buyer(
        db=db,
        buyer_id=buyer_id,
    )


async def get_contract_bids(
    db: AsyncSession,
    farmer_id: UUID,
    contract_id: UUID,
) -> list[ContractBid]:
    contract = await get_contract_by_id(
        db=db,
        contract_id=contract_id,
    )

    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    if contract.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot view bids for this contract",
        )

    return await contract_bid_repository.get_bids_by_contract(
        db=db,
        contract_id=contract_id,
    )


async def update_bid(
    db: AsyncSession,
    farmer_id: UUID,
    bid_id: UUID,
    data: ContractBidUpdate,
) -> ContractBid:
    bid = await contract_bid_repository.get_bid_by_id(
        db=db,
        bid_id=bid_id,
    )

    if bid is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found",
        )

    contract = await get_contract_by_id(
        db=db,
        contract_id=bid.contract_id,
    )

    if contract is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contract not found",
        )

    if contract.farmer_id != farmer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot update this bid",
        )

    if bid.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending bids can be updated",
        )

    if data.status == ContractBidStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be ACCEPTED or REJECTED",
        )

    bid.status = data.status.value

    if data.status == ContractBidStatus.ACCEPTED:
        contract.buyer_id = bid.buyer_id
        contract.status = "ACCEPTED"
        rejected_bids = await contract_bid_repository.reject_pending_bids_except(
            db,
            contract_id=contract.id,
            accepted_bid_id=bid.id,
        )
        create_notification(
            db,
            user_id=bid.buyer_id,
            title="Contract bid accepted",
            message=f"Your bid for '{contract.title}' was accepted.",
            notification_type="CONTRACT_BID_ACCEPTED",
            related_id=contract.id,
        )
        for rejected_bid in rejected_bids:
            create_notification(
                db,
                user_id=rejected_bid.buyer_id,
                title="Contract bid closed",
                message=f"Another bid was accepted for '{contract.title}'.",
                notification_type="CONTRACT_BID_REJECTED",
                related_id=contract.id,
            )
    else:
        create_notification(
            db,
            user_id=bid.buyer_id,
            title="Contract bid rejected",
            message=f"Your bid for '{contract.title}' was rejected.",
            notification_type="CONTRACT_BID_REJECTED",
            related_id=contract.id,
        )

    return await contract_bid_repository.update_bid(
        db=db,
        bid=bid,
    )

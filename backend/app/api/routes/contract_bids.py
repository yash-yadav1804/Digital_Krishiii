from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_role
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.contract_bid import (
    ContractBidCreate,
    ContractBidResponse,
    ContractBidUpdate,
)
from app.services.contract_bid_service import (
    create_bid,
    get_buyer_bids,
    get_contract_bids,
    update_bid,
)

router = APIRouter(
    prefix="/contract-bids",
    tags=["Contract Bids"],
)


@router.post(
    "",
    response_model=ContractBidResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_bid_route(
    data: ContractBidCreate,
    current_user: User = Depends(require_role("BUYER")),
    db: AsyncSession = Depends(get_db),
):
    return await create_bid(
        db=db,
        buyer_id=current_user.id,
        data=data,
    )


@router.get(
    "/mine",
    response_model=list[ContractBidResponse],
)
async def list_my_bids_route(
    current_user: User = Depends(require_role("BUYER")),
    db: AsyncSession = Depends(get_db),
):
    return await get_buyer_bids(
        db=db,
        buyer_id=current_user.id,
    )


@router.get(
    "/contract/{contract_id}",
    response_model=list[ContractBidResponse],
)
async def list_contract_bids_route(
    contract_id: UUID,
    current_user: User = Depends(require_role("FARMER")),
    db: AsyncSession = Depends(get_db),
):
    return await get_contract_bids(
        db=db,
        farmer_id=current_user.id,
        contract_id=contract_id,
    )


@router.patch(
    "/{bid_id}",
    response_model=ContractBidResponse,
)
async def update_bid_route(
    bid_id: UUID,
    data: ContractBidUpdate,
    current_user: User = Depends(require_role("FARMER")),
    db: AsyncSession = Depends(get_db),
):
    return await update_bid(
        db=db,
        farmer_id=current_user.id,
        bid_id=bid_id,
        data=data,
    )

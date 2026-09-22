from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.contract_negotiation import (
    NegotiationCreate,
    NegotiationDecision,
    NegotiationResponse,
)
from app.services.contract_negotiation_service import ContractNegotiationService

router = APIRouter(prefix="/contracts", tags=["Contract Negotiations"])


def get_negotiation_service(
    db: AsyncSession = Depends(get_db),
) -> ContractNegotiationService:
    return ContractNegotiationService(db)


@router.get("/{contract_id}/negotiations", response_model=list[NegotiationResponse])
async def list_negotiations(
    contract_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ContractNegotiationService = Depends(get_negotiation_service),
):
    return await service.list(contract_id=contract_id, user_id=current_user.id)


@router.post(
    "/{contract_id}/negotiations",
    response_model=NegotiationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_negotiation(
    contract_id: UUID,
    data: NegotiationCreate,
    current_user: User = Depends(get_current_user),
    service: ContractNegotiationService = Depends(get_negotiation_service),
):
    return await service.create(contract_id=contract_id, sender_id=current_user.id, data=data)


@router.patch("/negotiations/{negotiation_id}", response_model=NegotiationResponse)
async def decide_negotiation(
    negotiation_id: UUID,
    data: NegotiationDecision,
    current_user: User = Depends(get_current_user),
    service: ContractNegotiationService = Depends(get_negotiation_service),
):
    return await service.decide(negotiation_id=negotiation_id, user_id=current_user.id, data=data)

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.contract import Contract
from app.db.models.contract_negotiation import ContractNegotiation
from app.repositories.contract_negotiation_repository import ContractNegotiationRepository
from app.repositories.contract_repository import get_contract_by_id
from app.schemas.contract_negotiation import (
    NegotiationCreate,
    NegotiationDecision,
    NegotiationStatus,
)
from app.services.notification_service import create_notification


class ContractNegotiationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = ContractNegotiationRepository(db)

    @staticmethod
    def _ensure_participant(contract: Contract, user_id: UUID) -> None:
        if user_id not in {contract.farmer_id, contract.buyer_id}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only contract participants can access negotiations",
            )

    async def _get_participant_contract(self, contract_id: UUID, user_id: UUID) -> Contract:
        contract = await get_contract_by_id(self.db, contract_id)
        if contract is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
        self._ensure_participant(contract, user_id)
        return contract

    async def list(self, *, contract_id: UUID, user_id: UUID) -> list[ContractNegotiation]:
        await self._get_participant_contract(contract_id, user_id)
        return await self.repository.get_by_contract(contract_id)

    async def create(
        self, *, contract_id: UUID, sender_id: UUID, data: NegotiationCreate
    ) -> ContractNegotiation:
        contract = await self._get_participant_contract(contract_id, sender_id)
        if contract.buyer_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contract must have an accepted buyer before negotiation can start",
            )
        if contract.status in {"COMPLETED", "CANCELLED", "REJECTED"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Negotiations are unavailable for this contract status",
            )

        if (
            data.proposed_start_date is not None
            and data.proposed_start_date < contract.start_date
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposed start date cannot be before the contract start date",
            )
        if (
            data.proposed_end_date is not None
            and data.proposed_end_date > contract.end_date
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Proposed end date cannot be after the contract end date",
            )

        negotiation = ContractNegotiation(
            contract_id=contract.id,
            sender_id=sender_id,
            proposed_quantity=data.proposed_quantity,
            proposed_price_per_unit=data.proposed_price_per_unit,
            proposed_start_date=data.proposed_start_date,
            proposed_end_date=data.proposed_end_date,
            proposed_terms=data.proposed_terms,
            message=data.message,
            image_url=data.image_url,
            status="PENDING",
        )
        contract.status = "NEGOTIATING"
        recipient_id = contract.buyer_id if sender_id == contract.farmer_id else contract.farmer_id
        if recipient_id is not None:
            create_notification(
                self.db,
                user_id=recipient_id,
                title="New contract proposal",
                message=f"You received a proposal for '{contract.title}'.",
                notification_type="CONTRACT_NEGOTIATION",
                related_id=contract.id,
            )
        return await self.repository.create(negotiation)

    async def decide(
        self, *, negotiation_id: UUID, user_id: UUID, data: NegotiationDecision
    ) -> ContractNegotiation:
        negotiation = await self.repository.get_by_id(negotiation_id)
        if negotiation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Negotiation not found")
        contract = await self._get_participant_contract(negotiation.contract_id, user_id)
        if negotiation.sender_id == user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot decide your own proposal",
            )
        if negotiation.status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending proposals can be decided",
            )
        if data.status not in {NegotiationStatus.ACCEPTED, NegotiationStatus.REJECTED}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be ACCEPTED or REJECTED",
            )

        negotiation.status = data.status.value
        if data.status == NegotiationStatus.ACCEPTED:
            if negotiation.proposed_quantity is not None:
                contract.quantity = negotiation.proposed_quantity
            if negotiation.proposed_price_per_unit is not None:
                contract.price_per_unit = negotiation.proposed_price_per_unit
            if negotiation.proposed_start_date is not None:
                contract.start_date = negotiation.proposed_start_date
            if negotiation.proposed_end_date is not None:
                contract.end_date = negotiation.proposed_end_date
            contract.status = "ACCEPTED"

        create_notification(
            self.db,
            user_id=negotiation.sender_id,
            title=f"Contract proposal {data.status.value.lower()}",
            message=f"Your proposal for '{contract.title}' was {data.status.value.lower()}.",
            notification_type="CONTRACT_NEGOTIATION_DECISION",
            related_id=contract.id,
        )
        return await self.repository.update(negotiation)

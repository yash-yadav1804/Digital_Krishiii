from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ContractBidStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class ContractBidCreate(BaseModel):
    contract_id: UUID

    offered_quantity: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    offered_price_per_unit: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    message: str | None = None


class ContractBidUpdate(BaseModel):
    status: ContractBidStatus


class ContractBidResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    buyer_id: UUID
    offered_quantity: Decimal
    offered_price_per_unit: Decimal
    message: str | None
    status: ContractBidStatus

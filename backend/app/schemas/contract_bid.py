from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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
    status: str = Field(
        min_length=3,
        max_length=30,
    )


class ContractBidResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    buyer_id: UUID
    offered_quantity: Decimal
    offered_price_per_unit: Decimal
    message: str | None
    status: str

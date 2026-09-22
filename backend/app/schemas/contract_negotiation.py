from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class NegotiationStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class NegotiationCreate(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    proposed_quantity: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    proposed_price_per_unit: Decimal | None = Field(
        default=None, gt=0, max_digits=12, decimal_places=2
    )
    proposed_start_date: date | None = None
    proposed_end_date: date | None = None
    proposed_terms: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_proposed_dates(self) -> "NegotiationCreate":
        if (
            self.proposed_start_date is not None
            and self.proposed_end_date is not None
            and self.proposed_end_date < self.proposed_start_date
        ):
            raise ValueError("Proposed end date must be after proposed start date")
        return self


class NegotiationDecision(BaseModel):
    status: NegotiationStatus


class NegotiationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    sender_id: UUID
    proposed_quantity: Decimal | None
    proposed_price_per_unit: Decimal | None
    proposed_start_date: date | None
    proposed_end_date: date | None
    proposed_terms: str | None
    message: str
    status: NegotiationStatus
    created_at: datetime
    image_url: str | None

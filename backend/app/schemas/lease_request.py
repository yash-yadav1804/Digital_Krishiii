from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LeaseRequestStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class LeaseRequestCreate(BaseModel):
    listing_id: UUID
    start_date: date
    end_date: date
    offered_rate_per_acre: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    message: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_date_range(self) -> "LeaseRequestCreate":
        if self.end_date <= self.start_date:
            raise ValueError("End date must be after start date")
        return self


class LeaseRequestUpdate(BaseModel):
    status: LeaseRequestStatus


class LeaseRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    listing_id: UUID
    buyer_id: UUID
    start_date: date
    end_date: date
    offered_rate_per_acre: Decimal
    message: str | None
    status: LeaseRequestStatus
    created_at: datetime
    updated_at: datetime

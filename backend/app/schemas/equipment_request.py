from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EquipmentRequestStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class EquipmentRequestCreate(BaseModel):
    equipment_id: UUID
    start_date: date
    end_date: date
    agreed_rate_per_day: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    message: str | None = Field(default=None, max_length=5000)

    @model_validator(mode="after")
    def validate_dates(self) -> "EquipmentRequestCreate":
        if self.end_date < self.start_date:
            raise ValueError("End date must be on or after start date")
        return self


class EquipmentRequestUpdate(BaseModel):
    status: EquipmentRequestStatus


class EquipmentRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    equipment_id: UUID
    farmer_id: UUID
    start_date: date
    end_date: date
    agreed_rate_per_day: Decimal
    message: str | None
    status: EquipmentRequestStatus
    created_at: datetime
    updated_at: datetime

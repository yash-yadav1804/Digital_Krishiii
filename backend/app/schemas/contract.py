from datetime import date
from decimal import Decimal
from uuid import UUID
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ContractStatus(StrEnum):
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    NEGOTIATING = "NEGOTIATING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"


class ContractCreate(BaseModel):
    land_id: UUID
    crop_id: UUID

    title: str = Field(
        min_length=3,
        max_length=150,
    )

    description: str | None = None

    quantity: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    price_per_unit: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    start_date: date
    end_date: date
    image_url: str | None = Field(default=None, max_length=1000)


class ContractUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=150,
    )

    description: str | None = None

    quantity: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    price_per_unit: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )

    start_date: date | None = None
    end_date: date | None = None
    status: ContractStatus | None = None
    image_url: str | None = Field(default=None, max_length=1000)


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    farmer_id: UUID
    buyer_id: UUID | None
    land_id: UUID
    crop_id: UUID

    title: str
    description: str | None
    quantity: Decimal
    price_per_unit: Decimal

    start_date: date
    end_date: date
    status: str
    image_url: str | None

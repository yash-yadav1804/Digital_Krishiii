from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


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
    status: str | None = None


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

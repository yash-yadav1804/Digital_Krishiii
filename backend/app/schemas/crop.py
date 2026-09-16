import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CropCreate(BaseModel):
    land_id: uuid.UUID

    crop_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    season: str | None = Field(
        default=None,
        max_length=100,
    )

    sowing_date: date | None = None

    expected_harvest_date: date | None = None

    expected_yield: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )


class CropUpdate(BaseModel):
    land_id: uuid.UUID | None = None

    crop_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    season: str | None = Field(
        default=None,
        max_length=100,
    )

    sowing_date: date | None = None

    expected_harvest_date: date | None = None

    expected_yield: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )


class CropResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    farmer_id: uuid.UUID
    land_id: uuid.UUID

    crop_name: str
    season: str | None

    sowing_date: date | None
    expected_harvest_date: date | None

    expected_yield: Decimal | None

    created_at: datetime
    updated_at: datetime

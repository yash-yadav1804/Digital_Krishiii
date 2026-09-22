import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class LandCreate(BaseModel):
    land_name: str = Field(..., min_length=2, max_length=150)
    village: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=150)
    area_acres: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    soil_type: str | None = Field(default=None, max_length=100)
    irrigation_type: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)


class LandUpdate(BaseModel):
    land_name: str | None = Field(default=None, min_length=2, max_length=150)
    village: str | None = Field(default=None, max_length=150)
    district: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=150)
    area_acres: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )
    soil_type: str | None = Field(default=None, max_length=100)
    irrigation_type: str | None = Field(default=None, max_length=100)
    image_url: str | None = Field(default=None, max_length=1000)


class LandResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    farmer_id: uuid.UUID
    land_name: str
    village: str | None
    district: str | None
    state: str | None
    area_acres: Decimal
    soil_type: str | None
    irrigation_type: str | None
    created_at: datetime
    updated_at: datetime
    image_url: str | None

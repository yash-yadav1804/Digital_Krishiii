from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EquipmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=5000)
    condition: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=200)
    rental_price_per_day: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    is_available: bool = True
    image_url: str | None = Field(default=None, max_length=1000)


class EquipmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=5000)
    condition: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=200)
    rental_price_per_day: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    is_available: bool | None = None
    image_url: str | None = Field(default=None, max_length=1000)


class EquipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    provider_id: UUID
    name: str
    category: str
    description: str | None
    condition: str | None
    location: str | None
    rental_price_per_day: Decimal
    is_available: bool
    created_at: datetime
    updated_at: datetime
    image_url: str | None

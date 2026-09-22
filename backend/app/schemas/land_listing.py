from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class LandListingType(StrEnum):
    RENTAL = "RENTAL"
    LEASE = "LEASE"


class LandListingStatus(StrEnum):
    OPEN = "OPEN"
    LEASED = "LEASED"
    CLOSED = "CLOSED"


class LandListingCreate(BaseModel):
    land_id: UUID
    listing_type: LandListingType = LandListingType.LEASE
    rate_per_acre: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    min_duration_months: int = Field(ge=1, le=120)
    max_duration_months: int = Field(ge=1, le=120)
    description: str | None = Field(default=None, max_length=5000)
    image_url: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_duration_range(self) -> "LandListingCreate":
        if self.max_duration_months < self.min_duration_months:
            raise ValueError("Maximum duration must be at least the minimum duration")
        return self


class LandListingUpdate(BaseModel):
    listing_type: LandListingType | None = None
    rate_per_acre: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    min_duration_months: int | None = Field(default=None, ge=1, le=120)
    max_duration_months: int | None = Field(default=None, ge=1, le=120)
    description: str | None = Field(default=None, max_length=5000)
    status: LandListingStatus | None = None
    image_url: str | None = Field(default=None, max_length=1000)


class LandListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    land_id: UUID
    farmer_id: UUID
    listing_type: LandListingType
    rate_per_acre: Decimal
    min_duration_months: int
    max_duration_months: int
    description: str | None
    status: LandListingStatus
    created_at: datetime
    updated_at: datetime
    image_url: str | None

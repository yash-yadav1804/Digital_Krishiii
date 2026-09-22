from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BuyerProfileCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    company_name: str | None = Field(default=None, max_length=200)
    phone_number: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=150)
    business_description: str | None = None
    image_url: str | None = Field(default=None, max_length=1000)


class BuyerProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    company_name: str | None = Field(default=None, max_length=200)
    phone_number: str | None = Field(default=None, max_length=20)
    city: str | None = Field(default=None, max_length=150)
    state: str | None = Field(default=None, max_length=150)
    business_description: str | None = None
    image_url: str | None = Field(default=None, max_length=1000)


class BuyerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    full_name: str
    company_name: str | None
    phone_number: str | None
    city: str | None
    state: str | None
    business_description: str | None
    created_at: datetime
    updated_at: datetime
    image_url: str | None

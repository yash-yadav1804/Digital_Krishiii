from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FarmerProfileCreate(BaseModel):
    user_id: UUID
    full_name: str
    phone_number: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    land_details: str | None = None


class FarmerProfileUpdate(BaseModel):
    full_name: str | None = None
    phone_number: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    land_details: str | None = None


class FarmerProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    phone_number: str | None
    village: str | None
    district: str | None
    state: str | None
    land_details: str | None

    model_config = ConfigDict(from_attributes=True)

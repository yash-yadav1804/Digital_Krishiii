from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    is_active: bool


class UpdateUserStatusRequest(BaseModel):
    is_active: bool

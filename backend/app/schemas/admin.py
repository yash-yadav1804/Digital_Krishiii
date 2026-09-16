from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    is_active: bool
    roles: list[str] = Field(default_factory=list)


class UpdateUserStatusRequest(BaseModel):
    is_active: bool

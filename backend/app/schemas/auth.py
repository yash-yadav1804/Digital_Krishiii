from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="farmer")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    is_active: bool = True
    roles: list[str] = []

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        if hasattr(obj, "roles"):
            data = {
                "id": obj.id,
                "email": obj.email,
                "is_active": obj.is_active,
                "roles": [r.name for r in obj.roles] if obj.roles else [],
            }
            return cls(**data)
        return super().model_validate(obj, *args, **kwargs)

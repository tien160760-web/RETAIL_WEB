
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=20)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError(
                "Mật khẩu vượt quá độ dài cho phép. Vui lòng sử dụng mật khẩu ngắn hơn."
            )
        return value

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    roles: list[str]
    branch_ids: list[int]


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    username: str
    email: str
    full_name: str
    phone: str | None
    is_active: bool
    roles: list[str]
    branch_ids: list[int]
    created_at: datetime


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(
        default=None, min_length=1, max_length=100
    )
    phone: str | None = Field(default=None, max_length=20)

from typing import Annotated

from pydantic import EmailStr, Field, StringConstraints

from src.schemas import CustomBaseModel


class UserCreate(CustomBaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: Annotated[str, StringConstraints(strip_whitespace=False, min_length=8, max_length=128)]

class UserResponse(CustomBaseModel):
    id: int
    username: str
    email: str

class TokenResponse(CustomBaseModel):
    access_token: str
    token_type: str = 'bearer'
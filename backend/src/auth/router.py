from typing import Annotated

from fastapi import APIRouter, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from src.auth import service
from src.auth.dependencies import CurrentUser, ValidUserCreate
from src.auth.exceptions import InvalidCredentialsException
from src.auth.schemas import UserResponse, UserCreate, TokenResponse
from src.auth.security import create_access_token
from src.database import SessionDep
from src.auth import service

router = APIRouter()

@router.post('/register', status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register_user(data: ValidUserCreate, session: SessionDep):
    return await service.create_user(session, data)

@router.post('/login', status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def login_user(form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep):
    user = await service.authenticate_user(session, form.username, form.password)
    if user is None:
        raise InvalidCredentialsException()
    return TokenResponse(access_token=create_access_token(user.id))

@router.get('/me', response_model=UserResponse)
async def me(user: CurrentUser):
    return user
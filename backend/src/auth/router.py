from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from src.auth import service
from src.auth.dependencies import CurrentUser, ValidRefreshToken, ValidUserCreate
from src.auth.exceptions import InvalidCredentialsException, InvalidTokenException
from src.auth.schemas import TokenResponse, UserResponse
from src.auth.security import create_access_token
from src.auth.utils import delete_refresh_cookie, set_refresh_cookie
from src.database import SessionDep

router = APIRouter()

@router.post('/register', status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register_user(data: ValidUserCreate, session: SessionDep):
    return await service.create_user(session, data)

@router.post('/login', status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def login_user(response: Response, form: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep):
    user = await service.authenticate_user(session, form.username, form.password)
    if user is None:
        raise InvalidCredentialsException()
    refresh_token = await service.create_refresh_token(session, user.id)
    set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=create_access_token(user.id))

@router.get('/me', response_model=UserResponse)
async def me(user: CurrentUser):
    return user

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(response: Response, old_token: ValidRefreshToken, session: SessionDep):
    user = await service.get_user_by_id(session, old_token.user_id)
    if user is None or not user.is_active:
        raise InvalidTokenException()
    new_refresh_token = await service.rotate_refresh_token(session, old_token)
    set_refresh_cookie(response, new_refresh_token)
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response, token: ValidRefreshToken, session: SessionDep) -> None:
    await service.delete_refresh_token(session, token)
    delete_refresh_cookie(response)
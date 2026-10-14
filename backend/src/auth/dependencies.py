from datetime import datetime, UTC
from typing import Annotated

from fastapi import Depends, Cookie
from fastapi.security import OAuth2PasswordBearer

from src.auth import service
from src.auth.constants import REFRESH_TOKEN_COOKIE
from src.auth.exceptions import EmailTakenException, InvalidTokenException, UsernameTakenException
from src.auth.models import User, RefreshToken
from src.auth.schemas import UserCreate
from src.auth.security import decode_access_token
from src.database import SessionDep

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise InvalidTokenException()
    user = await service.get_user_by_id(session, user_id)
    if user is None or not user.is_active:
        raise InvalidTokenException()
    return user

async def valid_user_create(data: UserCreate, session: SessionDep) -> UserCreate:
    if await service.get_user_by_email(session, data.email) is not None:
        raise EmailTakenException()
    if await service.get_user_by_username(session, data.username) is not None:
        raise UsernameTakenException()
    return data

async def valid_refresh_token(
    session: SessionDep,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_TOKEN_COOKIE)] = None,
) -> RefreshToken:
    if refresh_token is None:
        raise InvalidTokenException()
    db_token = await service.get_refresh_token(session, refresh_token)
    if db_token is None or db_token.expires_at < datetime.now(UTC):
        raise InvalidTokenException()
    return db_token


ValidRefreshToken = Annotated[RefreshToken, Depends(valid_refresh_token)]
CurrentUser = Annotated[User, Depends(get_current_user)]
ValidUserCreate = Annotated[UserCreate, Depends(valid_user_create)]
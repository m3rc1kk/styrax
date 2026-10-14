from fastapi import Response

from src.auth.config import auth_settings
from src.auth.constants import REFRESH_TOKEN_COOKIE
from src.config import settings

def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=token,
        max_age=auth_settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=not settings.ENVIRONMENT.is_debug,
        samesite="lax",
        path="/auth",
    )

def delete_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_TOKEN_COOKIE, path="/auth")
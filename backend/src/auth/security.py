import hashlib
import secrets
from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from src.auth.config import auth_settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)

def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=auth_settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {'sub': str(user_id), 'exp': expire}
    return jwt.encode(
        payload,
        auth_settings.JWT_SECRET.get_secret_value(),
        algorithm=auth_settings.JWT_ALGORITHM
    )

def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(
            token,
            auth_settings.JWT_SECRET.get_secret_value(),
            algorithms=[auth_settings.JWT_ALGORITHM],
        )
    except jwt.InvalidTokenError:
        return None
    return int(payload['sub'])

def generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
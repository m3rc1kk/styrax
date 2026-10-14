from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import UTC, datetime, timedelta

from src.auth.config import auth_settings
from src.auth.models import User, RefreshToken
from src.auth.schemas import UserCreate
from src.auth.security import hash_password, verify_password, generate_refresh_token, hash_refresh_token


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.get(User, user_id)

async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    return await session.scalar(select(User).where(User.email == email.lower()))

async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    return await session.scalar(select(User).where(User.username == username))

async def create_user(session: AsyncSession, data: UserCreate) -> User:
    user = User(
        username=data.username,
        email=data.email.lower(),
        hashed_password=hash_password(data.password)
    )

    session.add(user)
    await session.commit()
    return user


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(session, email)
    if user is None or not verify_password(password, user.hashed_password):
        return None
    return user


async def create_refresh_token(session: AsyncSession, user_id: int) -> str:
    token = generate_refresh_token()
    session.add(RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(token),
        expires_at=datetime.now(UTC) + timedelta(days=auth_settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    )
    await session.commit()
    return token


async def get_refresh_token(session: AsyncSession, token: str) -> RefreshToken | None:
    stmt = select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(token))
    return await session.scalar(stmt)

async def rotate_refresh_token(session: AsyncSession, old_token: RefreshToken) -> str:
    await session.delete(old_token)
    return await create_refresh_token(session, old_token.user_id)


async def delete_refresh_token(session: AsyncSession, refresh_token: RefreshToken) -> None:
    await session.delete(refresh_token)
    await session.commit()
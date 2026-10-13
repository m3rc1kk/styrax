from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.schemas import UserCreate
from src.auth.security import hash_password, verify_password


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.get(User, user_id)

async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    return await session.scalar(select(User).where(User.email == email.lower()))

async def get_user_by_username(session: AsyncSession, username: str) -> User | None:
    return await session.scalar(select(User).where(User.username == username))

async def create_user(session: AsyncSession, data: UserCreate) -> User | None:
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
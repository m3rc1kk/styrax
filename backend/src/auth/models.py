from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, false
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base
from src.models import TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "user_account"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(250), unique=True)
    username: Mapped[str] = mapped_column(String(30), unique=True)
    hashed_password: Mapped[str] = mapped_column(String(250))
    is_active: Mapped[bool] = mapped_column(default=True)
    is_superuser: Mapped[bool] = mapped_column(default=False, server_default=false())

class RefreshToken(TimestampMixin, Base):
    __tablename__ = "refresh_token"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))



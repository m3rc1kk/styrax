from sqlalchemy import String
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


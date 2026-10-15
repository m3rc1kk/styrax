from sqlalchemy import UniqueConstraint, CheckConstraint, ForeignKey, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import TimestampMixin
from src.database import Base
from src.music.models import Track, Album
from src.ratings.constants import RATING_MAX, RATING_MIN

class TrackRating(TimestampMixin, Base):
    __tablename__ = "track_rating"
    __table_args__ = (
        UniqueConstraint("user_id", "track_id"),
        CheckConstraint(f'rating BETWEEN {RATING_MIN} AND {RATING_MAX}', name='score_range'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("track.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(SmallInteger)

    track: Mapped[Track] = relationship(lazy='raise')


class AlbumRating(TimestampMixin, Base):
    __tablename__ = "album_rating"
    __table_args__ = (
        UniqueConstraint("user_id", "album_id"),
        CheckConstraint(f'rating BETWEEN {RATING_MIN} AND {RATING_MAX}', name='score_range'),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    album_id: Mapped[int] = mapped_column(ForeignKey("album.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(SmallInteger)

    album: Mapped[Album] = relationship(lazy='raise')

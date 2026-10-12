from datetime import date

from sqlalchemy import String, Enum, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database import Base
from src.models import TimestampMixin
from src.music.constants import AlbumType


class Artist(TimestampMixin, Base):
    __tablename__ = "artist"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    albums: Mapped[list['Album']] = relationship(
        back_populates="artist",
        lazy='raise',
        passive_deletes = True,
    )


class Album(TimestampMixin, Base):
    __tablename__ = "album"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(60))
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artist.id", ondelete="CASCADE",),
        index=True,
    )
    release_date: Mapped[date | None]
    artist: Mapped['Artist'] = relationship(
        back_populates="albums",
        lazy='raise'
    )
    cover_url: Mapped[str | None] = mapped_column(String(512))
    tracks: Mapped[list['Track']] = relationship(
        back_populates="album",
        lazy='raise',
        passive_deletes = True,
        order_by = 'Track.track_number',
        cascade="all, delete-orphan",
    )

    album_type: Mapped[AlbumType] = mapped_column(
        Enum(AlbumType, native_enum=False, length=20),
        default = AlbumType.SINGLE,
    )



class Track(TimestampMixin, Base):
    __tablename__ = "track"
    __table_args__ = (
        UniqueConstraint("album_id", "track_number"),
        CheckConstraint("track_number > 0", name="track_number_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(60))
    album_id: Mapped[int] = mapped_column(
        ForeignKey("album.id", ondelete="CASCADE"),
    )
    track_number: Mapped[int]
    duration_sec: Mapped[int | None]
    album: Mapped['Album'] = relationship(
        back_populates="tracks",
        lazy='raise'
    )


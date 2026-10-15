from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.music.models import Track, Album
from src.ratings.models import TrackRating, AlbumRating


async def set_track_rating(session: AsyncSession, user_id: int, track_id: int, rating: int) -> TrackRating:
    stmt = (
        insert(TrackRating)
        .values(
            track_id=track_id,
            user_id=user_id,
            rating=rating
        )
        .on_conflict_do_update(
            index_elements=[TrackRating.user_id, TrackRating.track_id],
            set_={'rating': rating, 'updated_at': func.now()}
        )
        .returning(TrackRating)
    )
    result = await session.scalars(stmt, execution_options={'populate_existing': True})
    rating_result = result.one()
    await session.commit()
    return rating_result

async def get_track_rating(session: AsyncSession, user_id: int, track_id: int) -> TrackRating | None:
    stmt = select(TrackRating).where(TrackRating.user_id == user_id, TrackRating.track_id == track_id)
    return await session.scalar(stmt)

async def get_track_stats(session: AsyncSession, track_id: int) -> tuple[float | None, int]:
    stmt = (
        select(func.avg(TrackRating.rating), func.count())
        .where(TrackRating.track_id == track_id)
    )
    average, count = (await session.execute(stmt)).one()
    return (round(float(average), 2) if average is not None else None, count)


async def list_my_track_ratings(session: AsyncSession, user_id: int, offset: int, limit: int) -> Sequence[TrackRating]:
    stmt = (
        select(TrackRating)
        .where(TrackRating.user_id == user_id)
        .options(selectinload(TrackRating.track).selectinload(Track.album).selectinload(Album.artist))
        .order_by(TrackRating.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.scalars(stmt)
    return result.all()


async def set_album_rating(session: AsyncSession, user_id: int, album_id: int, rating: int) -> AlbumRating:
    stmt = (
        insert(AlbumRating)
        .values(user_id=user_id, album_id=album_id, rating=rating)
        .on_conflict_do_update(
            index_elements=[AlbumRating.user_id, AlbumRating.album_id],
            set_={'rating': rating, 'updated_at': func.now()}
        )
        .returning(AlbumRating)
    )

    result = await session.scalars(stmt, execution_options={'populate_existing': True})
    rating_result = result.one()
    await session.commit()
    return rating_result

async def get_album_rating(session: AsyncSession, user_id: int, album_id: int) -> AlbumRating | None:
    stmt = (
        select(AlbumRating)
        .where(AlbumRating.user_id == user_id, AlbumRating.album_id == album_id)
    )

    return await session.scalar(stmt)

async def get_album_stats(session: AsyncSession, album_id: int) -> tuple[float | None, int]:
    stmt = select(func.avg(AlbumRating.rating), func.count()).where(AlbumRating.album_id == album_id)
    average, count = (await session.execute(stmt)).one()
    return (round(float(average), 2) if average is not None else None), count

async def list_my_album_ratings(session: AsyncSession, user_id: int, offset: int, limit: int) -> Sequence[AlbumRating]:
    stmt = (
        select(AlbumRating)
        .where(AlbumRating.user_id == user_id)
        .options(selectinload(AlbumRating.album).selectinload(Album.artist))
        .order_by(AlbumRating.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.scalars(stmt)
    return result.all()

async def delete_rating(session: AsyncSession, rating: TrackRating | AlbumRating) -> None:
    await session.delete(rating)
    await session.commit()


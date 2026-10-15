from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.music.schemas import ArtistCreate, ArtistUpdate, AlbumCreate, AlbumUpdate, TrackCreate, TrackUpdate
from src.music.models import Album, Artist, Track

async def create_artist(session: AsyncSession, data: ArtistCreate, user_id: int) -> Artist:
    artist = Artist(**data.model_dump(), created_by_id=user_id)
    session.add(artist)
    await session.commit()
    return artist

async def get_artist(session: AsyncSession, artist_id: int) -> Artist | None:
    return await session.get(Artist, artist_id)

async def list_artists(session: AsyncSession, offset: int = 0, limit: int = 100) -> Sequence[Artist]:
    stmt = select(Artist).order_by(Artist.name).offset(offset).limit(limit)
    result = await session.scalars(stmt)
    return result.all()

async def update_artist(session: AsyncSession, data: ArtistUpdate, artist: Artist) -> Artist:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(artist, field, value)
    await session.commit()
    return artist

async def delete_artist(session: AsyncSession, artist: Artist) -> None:
    await session.delete(artist)
    await session.commit()



async def create_album(session: AsyncSession, data: AlbumCreate, user_id: int) -> Album:
    album = Album(**data.model_dump(), created_by_id=user_id)
    session.add(album)
    await session.commit()
    await session.refresh(album, ["artist", "tracks"])
    return album

async def get_album(session: AsyncSession, album_id: int) -> Album | None:
    stmt = (
        select(Album)
        .where(Album.id == album_id)
        .options(selectinload(Album.artist), selectinload(Album.tracks))
    )

    return await session.scalar(stmt)

async def list_albums(session: AsyncSession, offset: int = 0, limit: int = 100) -> Sequence[Album]:
    stmt = (
        select(Album)
        .order_by(Album.id.desc())
        .options(selectinload(Album.artist))
        .offset(offset)
        .limit(limit)
    )

    result = await session.scalars(stmt)
    return result.all()

async def update_album(session: AsyncSession, album: Album, data: AlbumUpdate) -> Album:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(album, field, value)
    await session.commit()
    return album


async def delete_album(session: AsyncSession, album: Album) -> None:
    await session.delete(album)
    await session.commit()




async def create_track(session: AsyncSession, album_id: int, data: TrackCreate) -> Track:
    track = Track(album_id=album_id, **data.model_dump())
    session.add(track)
    await session.commit()
    return track

async def get_track(session: AsyncSession, track_id: int) -> Track | None:
    stmt = (
        select(Track)
        .where(Track.id == track_id)
        .options(selectinload(Track.album).selectinload(Album.artist))
    )
    return await session.scalar(stmt)


async def update_track(session: AsyncSession, track: Track, data: TrackUpdate) -> Track:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(track, field, value)
    await session.commit()
    return track

async def delete_track(session: AsyncSession, track: Track) -> None:
    await session.delete(track)
    await session.commit()


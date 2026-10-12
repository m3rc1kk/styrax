from typing import Annotated

from fastapi import Depends

from src.database import SessionDep
from src.music import service
from src.music.exceptions import AlbumNotFoundException, ArtistNotFoundException, TrackNotFoundException
from src.music.models import Album, Artist, Track
from src.music.schemas import AlbumCreate

async def valid_artist_id(artist_id: int, session: SessionDep) -> Artist:
    artist = await service.get_artist(session, artist_id)
    if artist is None:
        raise ArtistNotFoundException()
    return artist

async def valid_album_id(album_id: int, session: SessionDep) -> Album:
    album = await service.get_album(session, album_id)
    if album is None:
        raise AlbumNotFoundException()
    return album


async def valid_track_id(track_id: int, session: SessionDep) -> Track:
    track = await service.get_track(session, track_id)
    if track is None:
        raise TrackNotFoundException()
    return track


async def valid_album_create(data: AlbumCreate, session: SessionDep) -> AlbumCreate:
    if await service.get_artist(session, data.artist_id) is None:
        raise ArtistNotFoundException()
    return data

ValidArtist = Annotated[Artist, Depends(valid_artist_id)]
ValidAlbum = Annotated[Album, Depends(valid_album_id)]
ValidTrack = Annotated[Track, Depends(valid_track_id)]
ValidAlbumCreate = Annotated[AlbumCreate, Depends(valid_album_create)]
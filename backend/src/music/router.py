from typing import Annotated

from fastapi import APIRouter, Query, status
from sqlalchemy.exc import IntegrityError

from src.auth.dependencies import CurrentUser
from src.database import SessionDep
from src.music import service
from src.music.dependencies import ValidAlbum, ValidAlbumCreate, ValidArtist, ValidTrack, OwnedAlbum, OwnedArtist, \
    OwnedTrack
from src.music.exceptions import TrackNumberTakenException
from src.music.schemas import (
    AlbumDetailResponse,
    AlbumResponse,
    AlbumUpdate,
    ArtistCreate,
    ArtistResponse,
    ArtistUpdate,
    TrackCreate,
    TrackDetailResponse,
    TrackResponse,
    TrackUpdate,
)

router = APIRouter()


@router.post("/artists", status_code=status.HTTP_201_CREATED, response_model=ArtistResponse)
async def create_artist(data: ArtistCreate, session: SessionDep, user: CurrentUser):
    return await service.create_artist(session, data, user.id)


@router.get("/artists", response_model=list[ArtistResponse])
async def list_artists(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return await service.list_artists(session, offset=offset, limit=limit)


@router.get("/artists/{artist_id}", response_model=ArtistResponse)
async def get_artist(artist: ValidArtist):
    return artist


@router.patch("/artists/{artist_id}", response_model=ArtistResponse)
async def update_artist(artist: OwnedArtist, data: ArtistUpdate, session: SessionDep):
    return await service.update_artist(session, artist=artist, data=data)


@router.delete("/artists/{artist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_artist(artist: OwnedArtist, session: SessionDep) -> None:
    await service.delete_artist(session, artist)


@router.post("/albums", status_code=status.HTTP_201_CREATED, response_model=AlbumResponse)
async def create_album(data: ValidAlbumCreate, session: SessionDep, user: CurrentUser):
    return await service.create_album(session, data, user.id)


@router.get("/albums", response_model=list[AlbumResponse])
async def list_albums(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return await service.list_albums(session, offset=offset, limit=limit)


@router.get("/albums/{album_id}", response_model=AlbumDetailResponse)
async def get_album(album: ValidAlbum):
    return album


@router.patch("/albums/{album_id}", response_model=AlbumResponse)
async def update_album(album: OwnedAlbum, data: AlbumUpdate, session: SessionDep):
    return await service.update_album(session, album=album, data=data)


@router.delete("/albums/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album(album: OwnedAlbum, session: SessionDep) -> None:
    await service.delete_album(session, album)


@router.post(
    "/albums/{album_id}/tracks",
    status_code=status.HTTP_201_CREATED,
    response_model=TrackResponse,
)
async def create_track(album: OwnedAlbum, data: TrackCreate, session: SessionDep):
    try:
        return await service.create_track(session, album.id, data)
    except IntegrityError:
        raise TrackNumberTakenException()


@router.get("/tracks/{track_id}", response_model=TrackDetailResponse)
async def get_track(track: ValidTrack):
    return track


@router.patch("/tracks/{track_id}", response_model=TrackDetailResponse)
async def update_track(track: OwnedTrack, data: TrackUpdate, session: SessionDep):
    try:
        return await service.update_track(session, track=track, data=data)
    except IntegrityError:
        raise TrackNumberTakenException()


@router.delete("/tracks/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track(track: OwnedTrack, session: SessionDep) -> None:
    await service.delete_track(session, track)
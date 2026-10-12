from datetime import date

from pydantic import Field

from src.music.constants import AlbumType
from src.schemas import CustomBaseModel


class ArtistCreate(CustomBaseModel):
    name: str = Field(min_length=1, max_length=50)

class ArtistUpdate(CustomBaseModel):
    name: str = Field(default=None, min_length=1, max_length=50)

class ArtistResponse(CustomBaseModel):
    id: int
    name: str



class TrackCreate(CustomBaseModel):
    title: str = Field(min_length=1, max_length=50)
    track_number: int = Field(gt=0)
    duration_sec: int | None = Field(default=None, gt=0)

class TrackUpdate(CustomBaseModel):
    title: str = Field(default=None, min_length=1, max_length=50)
    track_number: int = Field(default=None, gt=0)
    duration_sec: int | None = Field(default=None, gt=0)

class TrackResponse(CustomBaseModel):
    id: int
    title: str
    duration_sec: int | None
    track_number: int
    album_id: int

class TrackDetailResponse(TrackResponse):
    album: AlbumResponse



class AlbumCreate(CustomBaseModel):
    title: str = Field(min_length=1, max_length=50)
    artist_id: int
    album_type: AlbumType = AlbumType.SINGLE
    release_date: date | None = None
    cover_url: str | None = Field(default=None, max_length=512)

class AlbumUpdate(CustomBaseModel):
    title: str = Field(default=None, min_length=1, max_length=50)
    album_type: AlbumType = Field(default=None)
    release_date: date | None = None
    cover_url: str | None = Field(default=None, max_length=512)

class AlbumResponse(CustomBaseModel):
    id: int
    title: str
    album_type: AlbumType
    release_date: date | None
    cover_url: str | None
    artist: ArtistResponse

class AlbumDetailResponse(AlbumResponse):
    tracks: list[TrackResponse]
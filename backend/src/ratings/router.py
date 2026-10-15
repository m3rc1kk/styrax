from typing import Annotated

from fastapi import APIRouter, Query, status

from src.auth.dependencies import CurrentUser
from src.database import SessionDep
from src.music.dependencies import ValidAlbum, ValidTrack
from src.ratings import service
from src.ratings.dependencies import MyAlbumRating, MyTrackRating
from src.ratings.schemas import (
    MyAlbumRatingResponse,
    MyTrackRatingResponse,
    RatingResponse,
    RatingSet,
    RatingStatsResponse,
)

router = APIRouter()


@router.get("/tracks/{track_id}/rating", response_model=RatingStatsResponse)
async def get_track_stats(track: ValidTrack, session: SessionDep):
    average, count = await service.get_track_stats(session, track.id)
    return RatingStatsResponse(average=average, count=count)


@router.get("/tracks/{track_id}/rating/me", response_model=RatingResponse)
async def get_my_track_rating(rating: MyTrackRating):
    return rating


@router.put("/tracks/{track_id}/rating/me", response_model=RatingResponse)
async def set_track_rating(track: ValidTrack, data: RatingSet, user: CurrentUser, session: SessionDep):
    return await service.set_track_rating(session, user.id, track.id, data.rating)


@router.delete("/tracks/{track_id}/rating/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track_rating(rating: MyTrackRating, session: SessionDep) -> None:
    await service.delete_rating(session, rating)


@router.get("/albums/{album_id}/rating", response_model=RatingStatsResponse)
async def get_album_stats(album: ValidAlbum, session: SessionDep):
    average, count = await service.get_album_stats(session, album.id)
    return RatingStatsResponse(average=average, count=count)


@router.get("/albums/{album_id}/rating/me", response_model=RatingResponse)
async def get_my_album_rating(rating: MyAlbumRating):
    return rating


@router.put("/albums/{album_id}/rating/me", response_model=RatingResponse)
async def set_album_rating(album: ValidAlbum, data: RatingSet, user: CurrentUser, session: SessionDep):
    return await service.set_album_rating(session, user.id, album.id, data.rating)


@router.delete("/albums/{album_id}/rating/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album_rating(rating: MyAlbumRating, session: SessionDep) -> None:
    await service.delete_rating(session, rating)


@router.get("/me/ratings/tracks", response_model=list[MyTrackRatingResponse])
async def list_my_track_ratings(
    user: CurrentUser,
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return await service.list_my_track_ratings(session, user.id, offset=offset, limit=limit)


@router.get("/me/ratings/albums", response_model=list[MyAlbumRatingResponse])
async def list_my_album_ratings(
    user: CurrentUser,
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    return await service.list_my_album_ratings(session, user.id, offset=offset, limit=limit)
from typing import Annotated

from fastapi import Depends

from src.auth.dependencies import CurrentUser
from src.database import SessionDep
from src.ratings import service
from src.ratings.exceptions import RatingNotFoundException
from src.ratings.models import TrackRating, AlbumRating


async def valid_my_track_rating(track_id: int, user: CurrentUser, session: SessionDep) -> TrackRating:
    rating = await service.get_track_rating(session, user.id, track_id)
    if rating is None:
        raise RatingNotFoundException()
    return rating

async def valid_my_album_rating(album_id: int, user: CurrentUser, session: SessionDep) -> AlbumRating:
    rating = await service.get_album_rating(session, user.id, album_id)
    if rating is None:
        raise RatingNotFoundException()
    return rating

MyTrackRating = Annotated[TrackRating, Depends(valid_my_track_rating)]
MyAlbumRating = Annotated[AlbumRating, Depends(valid_my_album_rating)]
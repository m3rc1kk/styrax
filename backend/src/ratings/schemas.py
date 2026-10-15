from datetime import datetime

from pydantic import Field

from src.music.schemas import AlbumResponse, TrackDetailResponse
from src.ratings.constants import RATING_MIN, RATING_MAX
from src.schemas import CustomBaseModel


class RatingSet(CustomBaseModel):
    rating: int = Field(ge=RATING_MIN, le=RATING_MAX)

class RatingResponse(CustomBaseModel):
    rating: int
    updated_at: datetime

class RatingStatsResponse(CustomBaseModel):
    average: float | None
    count: int

class MyTrackRatingResponse(RatingResponse):
    track: TrackDetailResponse

class MyAlbumRatingResponse(RatingResponse):
    album: AlbumResponse
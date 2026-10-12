from src.exceptions import ConflictException, NotFoundException

class ArtistNotFoundException(NotFoundException):
    DETAIL = "Artist not found"

class AlbumNotFoundException(NotFoundException):
    DETAIL = "Album not found"

class TrackNotFoundException(NotFoundException):
    DETAIL = "Track not found"

class TrackNumberTakenException(ConflictException):
    DETAIL = "Track with this number already exists in the album"
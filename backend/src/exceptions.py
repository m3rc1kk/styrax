from fastapi import HTTPException, status
from typing import Any

class DetailedHTTPException(HTTPException):
    STATUS_CODE = status.HTTP_500_INTERNAL_SERVER_ERROR
    DETAIL = 'Internal Server Error'

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(status_code=self.STATUS_CODE, detail=self.DETAIL, **kwargs)


class NotFoundException(DetailedHTTPException):
    STATUS_CODE = status.HTTP_404_NOT_FOUND

class ConflictException(DetailedHTTPException):
    STATUS_CODE = status.HTTP_409_CONFLICT

class NotAuthenticatedException(DetailedHTTPException):
    STATUS_CODE = status.HTTP_401_UNAUTHORIZED
    DETAIL = 'Unauthorized'

    def __init__(self) -> None:
        super().__init__(headers={"WWW-Authenticate": "Bearer"})
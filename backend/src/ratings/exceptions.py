from src.exceptions import NotFoundException

class RatingNotFoundException(NotFoundException):
    DETAIL = 'Rating not found'


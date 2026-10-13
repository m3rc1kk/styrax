from src.exceptions import ConflictException, NotAuthenticatedException


class EmailTakenException(ConflictException):
    DETAIL = "Email is already registered"


class UsernameTakenException(ConflictException):
    DETAIL = "Username is already taken"


class InvalidCredentialsException(NotAuthenticatedException):
    DETAIL = "Incorrect email or password"


class InvalidTokenException(NotAuthenticatedException):
    DETAIL = "Invalid or expired token"
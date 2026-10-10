from pydantic import SecretStr
from sqlalchemy import URL
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Any
from src.constants import Environment


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore'
    )

    ENVIRONMENT: Environment = Environment.PROD
    APP_NAME: str = 'Styrax'
    APP_VERSION: str = '1.0.0'

    POSTGRES_NAME: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: SecretStr
    POSTGRES_HOST: str
    POSTGRES_PORT: int

    DATABASE_POOL_SIZE: int = 10
    DATABASE_POOL_TTL: int = 60 * 20
    DATABASE_POOL_PRE_PING: bool = True

    CORS_ORIGINS: list[str] = []

    @property
    def DATABASE_URL(self) -> URL:
        return URL.create(
            drivername="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD.get_secret_value(),
            host=self.POSTGRES_HOST,
            database=self.POSTGRES_NAME,
            port=self.POSTGRES_PORT,
        )


settings = Config()

app_config: dict[str, Any] = {
    'title': settings.APP_NAME,
    'version': settings.APP_VERSION,
}

if not settings.ENVIRONMENT.is_debug:
    app_config['openapi_url'] = None
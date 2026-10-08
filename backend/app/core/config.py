"""Application settings, read from environment variables (or a local .env file)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Zoom Clone API"
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./zoom.db"

    # Where the Next.js app is served: used for invite links and CORS.
    frontend_url: str = "http://localhost:3000"
    # Comma separated list of additional origins allowed to call the API.
    extra_cors_origins: str = ""

    seed_on_startup: bool = True

    # How long an instant meeting stays open after the last person leaves.
    empty_room_grace_seconds: float = 60

    # The assignment assumes one logged-in user instead of real authentication.
    default_user_name: str = "Alex Morgan"
    default_user_email: str = "alex.morgan@example.com"

    @property
    def cors_origins(self) -> list[str]:
        extras = [origin.strip() for origin in self.extra_cors_origins.split(",")]
        origins = [self.frontend_url, *extras]
        return [origin.rstrip("/") for origin in origins if origin]


@lru_cache
def get_settings() -> Settings:
    return Settings()

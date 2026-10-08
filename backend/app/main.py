"""Application entry point: ``uvicorn app.main:app``."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import models  # noqa: F401  (registers the tables on Base.metadata)
from app.api.routes import health, meetings, users
from app.core.config import get_settings
from app.core.exceptions import DomainError
from app.db.base import Base
from app.db.seed import seed_database
from app.db.session import SessionLocal, engine
from app.realtime import socket


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Runs once at startup: create missing tables, then seed if empty.

    Free hosting tiers wipe the disk on every deploy, so the app has to be
    able to rebuild its SQLite database from nothing.
    """
    Base.metadata.create_all(engine)
    if get_settings().seed_on_startup:
        with SessionLocal() as db:
            seed_database(db)
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=settings.cors_origin_regex,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(DomainError)
    async def handle_domain_error(_request: Request, error: DomainError) -> JSONResponse:
        # Same shape as FastAPI's own errors, so the frontend reads one format.
        return JSONResponse(status_code=error.status_code, content={"detail": error.message})

    api = APIRouter(prefix=settings.api_prefix)
    api.include_router(health.router)
    api.include_router(users.router)
    api.include_router(meetings.router)
    app.include_router(api)
    app.include_router(socket.router)

    return app


app = create_app()

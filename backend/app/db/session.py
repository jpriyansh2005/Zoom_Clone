"""Database engine and session factory."""

from collections.abc import Iterator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings


def build_engine(database_url: str, **kwargs) -> Engine:
    """Create an engine. For SQLite, also switch on foreign key enforcement."""
    is_sqlite = database_url.startswith("sqlite")
    if is_sqlite:
        # FastAPI runs sync endpoints in a thread pool, so one connection can
        # be used from a thread other than the one that opened it.
        kwargs.setdefault("connect_args", {"check_same_thread": False})

    engine = create_engine(database_url, **kwargs)

    if is_sqlite:

        @event.listens_for(engine, "connect")
        def enable_foreign_keys(dbapi_connection, _record) -> None:
            # SQLite ignores FOREIGN KEY constraints unless asked, per connection.
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


engine = build_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one database session per request."""
    with SessionLocal() as session:
        yield session


def get_session_factory() -> sessionmaker[Session]:
    """FastAPI dependency for long-lived handlers (WebSockets).

    A WebSocket can stay open for an hour, so instead of holding one session
    for its whole life it opens a short session for each database operation.
    """
    return SessionLocal

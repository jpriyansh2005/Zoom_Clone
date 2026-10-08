"""Time helpers. Everything in the backend is handled in UTC."""

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Current time as a timezone-aware UTC datetime."""
    return datetime.now(UTC)


def to_utc(value: datetime) -> datetime:
    """Convert any datetime to aware UTC. Naive values are assumed to be UTC."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)

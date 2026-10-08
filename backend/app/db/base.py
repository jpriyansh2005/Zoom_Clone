"""Declarative base class and column types shared by every model."""

import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.types import TypeDecorator

from app.core.time import to_utc


class Base(DeclarativeBase):
    pass


def enum_column(enum_class: type[enum.Enum], constraint_name: str) -> Enum:
    """Column type that stores an enum as its lowercase value.

    SQLite has no enum type, so this becomes a VARCHAR with a CHECK
    constraint, named ``constraint_name``, that only allows the enum's values.
    """
    return Enum(
        enum_class,
        name=constraint_name,
        native_enum=False,
        create_constraint=True,
        length=20,
        values_callable=lambda members: [member.value for member in members],
    )


class UTCDateTime(TypeDecorator):
    """A datetime column that is always timezone-aware UTC in Python.

    SQLite has no timezone support and hands back naive datetimes, so values
    are converted to UTC on the way in and tagged as UTC on the way out. That
    keeps "naive or aware?" bugs out of the rest of the code.
    """

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value: datetime | None, dialect) -> datetime | None:
        if value is None:
            return None
        return to_utc(value).replace(tzinfo=None)

    def process_result_value(self, value: datetime | None, dialect) -> datetime | None:
        if value is None:
            return None
        return to_utc(value)

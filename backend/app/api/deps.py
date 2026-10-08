"""Dependencies shared by the API routes."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.services.user_service import get_or_create_default_user

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(db: DbSession) -> User:
    """The logged-in user.

    The assignment says to assume a default user instead of building login.
    Every route gets the user through this one function, so adding real
    authentication later means changing only this function.
    """
    return get_or_create_default_user(db)


CurrentUser = Annotated[User, Depends(get_current_user)]

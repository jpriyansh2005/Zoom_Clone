from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import User


def get_or_create_default_user(db: Session) -> User:
    """Return the single built-in account, creating it on first use."""
    settings = get_settings()
    user = db.scalar(select(User).where(User.email == settings.default_user_email))
    if user is None:
        user = User(name=settings.default_user_name, email=settings.default_user_email)
        db.add(user)
        db.commit()
    return user

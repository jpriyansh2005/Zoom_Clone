from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_current_user(user: CurrentUser):
    """The profile shown in the navbar."""
    return user

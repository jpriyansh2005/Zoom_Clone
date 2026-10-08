"""Meeting IDs: the 11-digit number people type or share to join a meeting."""

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Meeting

CODE_LENGTH = 11
_MAX_ATTEMPTS = 10
_INVITE_LINK_PATTERN = re.compile(r"/j/(\d+)")


def generate_meeting_code(db: Session) -> str:
    """Return a random 11-digit meeting ID that no meeting uses yet.

    ``secrets`` is used instead of ``random`` so IDs cannot be predicted.
    With 90 billion possible IDs a clash is very unlikely, but it is checked
    anyway, and the UNIQUE constraint on the column is the final guard.
    """
    lowest = 10 ** (CODE_LENGTH - 1)  # the first digit is never zero
    for _ in range(_MAX_ATTEMPTS):
        code = str(lowest + secrets.randbelow(9 * lowest))
        taken = db.scalar(select(Meeting.id).where(Meeting.code == code))
        if taken is None:
            return code
    raise RuntimeError("Could not generate a unique meeting ID.")


def normalize_meeting_code(raw: str) -> str:
    """Accept what a person might paste and return just the digits.

    Handles a bare ID (``86412345678``), a formatted ID (``864 1234 5678``)
    and a full invite link (``https://host/j/86412345678``).
    """
    link_match = _INVITE_LINK_PATTERN.search(raw)
    if link_match:
        return link_match.group(1)
    return re.sub(r"[\s-]", "", raw)

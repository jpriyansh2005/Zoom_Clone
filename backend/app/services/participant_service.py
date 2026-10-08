"""Business rules for people entering and leaving meeting rooms."""

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import MeetingEndedError
from app.core.time import utc_now
from app.models import Meeting, MeetingStatus, Participant, ParticipantRole, User


def join_meeting(
    db: Session,
    meeting: Meeting,
    display_name: str,
    *,
    role: ParticipantRole = ParticipantRole.PARTICIPANT,
    user: User | None = None,
) -> Participant:
    """Record that someone is entering the meeting and give them a session."""
    if meeting.status == MeetingStatus.ENDED:
        raise MeetingEndedError()
    participant = Participant(
        meeting=meeting,
        user=user,
        display_name=display_name,
        role=role,
        session_token=secrets.token_urlsafe(32),
    )
    db.add(participant)
    db.commit()
    return participant


def get_active_session(db: Session, meeting_code: str, session_token: str) -> Participant | None:
    """Find the participant a WebSocket belongs to.

    Returns ``None`` when the token is unknown, belongs to another meeting,
    was removed by the host, or the meeting has already ended.
    """
    participant = db.scalar(
        select(Participant)
        .join(Participant.meeting)
        .where(Participant.session_token == session_token, Meeting.code == meeting_code)
        .options(selectinload(Participant.meeting))
    )
    if participant is None or participant.removed_at is not None:
        return None
    if participant.meeting.status == MeetingStatus.ENDED:
        return None
    return participant


def mark_connected(db: Session, participant_id: int) -> None:
    """Clear ``left_at`` when someone comes back, e.g. after a page refresh."""
    participant = db.get(Participant, participant_id)
    if participant is not None and participant.left_at is not None:
        participant.left_at = None
        db.commit()


def mark_left(db: Session, participant_id: int) -> None:
    participant = db.get(Participant, participant_id)
    if participant is not None and participant.left_at is None:
        participant.left_at = utc_now()
        db.commit()


def remove_participant(db: Session, participant_id: int) -> None:
    """Host action: take someone out of the meeting and block their return."""
    participant = db.get(Participant, participant_id)
    if participant is None:
        return
    now = utc_now()
    participant.removed_at = now
    participant.left_at = participant.left_at or now
    db.commit()

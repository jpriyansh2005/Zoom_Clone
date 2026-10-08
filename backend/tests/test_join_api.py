from sqlalchemy import select

from app.models import Meeting, MeetingStatus, Participant
from app.services import meeting_service
from tests.conftest import API


def test_host_starts_a_scheduled_meeting_and_enters_as_host(client, api):
    code = api.schedule()["code"]

    session = api.start(code)

    assert session["role"] == "host"
    assert session["display_name"] == "Alex Morgan"
    assert session["session_token"]
    assert session["meeting"]["status"] == "live"
    assert session["meeting"]["started_at"] is not None


def test_guest_joins_with_a_display_name(api, db):
    code = api.create_instant()["code"]

    session = api.join(code, name="  Priya Sharma  ")

    assert session["role"] == "participant"
    assert session["display_name"] == "Priya Sharma"
    stored = db.scalar(select(Participant).where(Participant.id == session["participant_id"]))
    assert stored.user_id is None  # guests have no account
    assert stored.meeting.code == code


def test_guest_can_join_using_the_invite_link(client, api):
    meeting = api.create_instant()

    response = client.post(
        f"{API}/meetings/{meeting['code']}/join", json={"display_name": "Link Guest"}
    )

    assert meeting["join_url"].endswith(f"/j/{meeting['code']}")
    assert response.status_code == 200


def test_every_join_gets_its_own_session_token(api):
    code = api.create_instant()["code"]

    assert api.join(code)["session_token"] != api.join(code)["session_token"]


def test_join_requires_a_display_name(client, api):
    code = api.create_instant()["code"]

    for name in ("", "   "):
        response = client.post(f"{API}/meetings/{code}/join", json={"display_name": name})
        assert response.status_code == 422


def test_join_rejects_an_unknown_meeting(client):
    response = client.post(f"{API}/meetings/99999999999/join", json={"display_name": "Guest"})

    assert response.status_code == 404


def test_join_and_start_reject_an_ended_meeting(client, api, db):
    code = api.schedule()["code"]
    meeting = db.scalar(select(Meeting).where(Meeting.code == code))
    meeting_service.end_meeting(db, meeting)

    join = client.post(f"{API}/meetings/{code}/join", json={"display_name": "Late"})
    start = client.post(f"{API}/meetings/{code}/start", json={})

    assert join.status_code == 409
    assert start.status_code == 409
    assert "ended" in join.json()["detail"]


def test_ending_a_meeting_closes_open_attendance(api, db):
    code = api.create_instant()["code"]
    api.start(code)
    api.join(code, "Guest")
    meeting = db.scalar(select(Meeting).where(Meeting.code == code))

    meeting_service.end_meeting(db, meeting)

    db.expire_all()
    assert meeting.status == MeetingStatus.ENDED
    assert meeting.ended_at is not None
    assert all(participant.left_at is not None for participant in meeting.participants)

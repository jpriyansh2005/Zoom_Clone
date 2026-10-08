"""Tests for the meeting WebSocket: presence, chat, signalling, host controls."""

import asyncio

import pytest
from sqlalchemy import select
from starlette.websockets import WebSocketDisconnect

from app.models import Meeting, MeetingStatus, Participant
from app.realtime.rooms import (
    CLOSE_INVALID_SESSION,
    CLOSE_MEETING_ENDED,
    CLOSE_REMOVED_BY_HOST,
)
from app.realtime.socket import _end_if_abandoned
from tests.conftest import API


@pytest.fixture
def room(api):
    """A live meeting with a host session and one guest session."""
    code = api.create_instant()["code"]
    return api.start(code), api.join(code, "Guest")


def names(participants: list[dict]) -> list[str]:
    return sorted(participant["display_name"] for participant in participants)


def test_socket_rejects_an_unknown_token(client, api):
    code = api.create_instant()["code"]

    with client.websocket_connect(f"/ws/meetings/{code}?token=not-a-real-token") as socket:
        with pytest.raises(WebSocketDisconnect) as closed:
            socket.receive_json()

    assert closed.value.code == CLOSE_INVALID_SESSION


def test_token_from_one_meeting_does_not_open_another(client, api):
    session = api.join(api.create_instant()["code"])
    other_code = api.create_instant()["code"]

    url = f"/ws/meetings/{other_code}?token={session['session_token']}"
    with client.websocket_connect(url) as socket:
        with pytest.raises(WebSocketDisconnect):
            socket.receive_json()


def test_joining_and_leaving_is_announced(api, room):
    host, guest = room

    with api.socket(host) as host_socket:
        state = host_socket.receive_json()
        assert state["type"] == "room_state"
        assert state["self_id"] == host["participant_id"]
        assert names(state["participants"]) == ["Alex Morgan"]

        with api.socket(guest) as guest_socket:
            guest_state = guest_socket.receive_json()
            assert names(guest_state["participants"]) == ["Alex Morgan", "Guest"]

            joined = host_socket.receive_json()
            assert joined["type"] == "participant_joined"
            assert joined["participant"]["display_name"] == "Guest"
            assert joined["participant"]["role"] == "participant"

        left = host_socket.receive_json()
        assert left == {"type": "participant_left", "participant_id": guest["participant_id"]}


def test_leaving_is_recorded_in_the_database(api, room, db):
    host, _guest = room

    with api.socket(host) as host_socket:
        host_socket.receive_json()

    participant = db.get(Participant, host["participant_id"])
    assert participant.left_at is not None


def test_media_state_is_shared_with_everyone(api, room):
    host, guest = room

    with api.socket(host) as host_socket, api.socket(guest) as guest_socket:
        host_socket.receive_json()  # room_state
        host_socket.receive_json()  # guest joined
        guest_socket.receive_json()  # room_state

        guest_socket.send_json({"type": "media_state", "audio": True, "video": True})

        update = host_socket.receive_json()
        assert update["type"] == "participant_updated"
        assert update["participant"]["id"] == guest["participant_id"]
        assert update["participant"]["audio"] is True
        assert update["participant"]["video"] is True


def test_chat_reaches_everyone_including_the_sender(api, room):
    host, guest = room

    with api.socket(host) as host_socket, api.socket(guest) as guest_socket:
        host_socket.receive_json()
        host_socket.receive_json()
        guest_socket.receive_json()

        guest_socket.send_json({"type": "chat", "text": "  Hello everyone  "})

        for socket in (host_socket, guest_socket):
            event = socket.receive_json()
            assert event["type"] == "chat"
            assert event["message"]["text"] == "Hello everyone"
            assert event["message"]["sender_name"] == "Guest"
            assert event["message"]["sender_id"] == guest["participant_id"]


def test_webrtc_signal_is_relayed_only_to_its_target(api, room):
    host, guest = room
    code = host["meeting"]["code"]
    bystander = api.join(code, "Bystander")

    with (
        api.socket(host) as host_socket,
        api.socket(guest) as guest_socket,
        api.socket(bystander) as bystander_socket,
    ):
        host_socket.receive_json()  # room_state
        host_socket.receive_json()  # guest joined
        host_socket.receive_json()  # bystander joined
        guest_socket.receive_json()  # room_state
        guest_socket.receive_json()  # bystander joined
        bystander_socket.receive_json()  # room_state

        offer = {"description": {"type": "offer", "sdp": "fake"}}
        guest_socket.send_json({"type": "signal", "to": host["participant_id"], "data": offer})
        assert host_socket.receive_json() == {
            "type": "signal",
            "from": guest["participant_id"],
            "data": offer,
        }

        # The bystander's next message is the chat below, not the signal.
        guest_socket.send_json({"type": "chat", "text": "ping"})
        assert bystander_socket.receive_json()["type"] == "chat"


def test_host_can_mute_everyone(api, room):
    host, guest = room

    with api.socket(host) as host_socket, api.socket(guest) as guest_socket:
        host_socket.receive_json()
        host_socket.receive_json()
        guest_socket.receive_json()
        guest_socket.send_json({"type": "media_state", "audio": True, "video": False})
        host_socket.receive_json()  # guest unmuted
        guest_socket.receive_json()  # own update

        host_socket.send_json({"type": "mute_all"})

        assert guest_socket.receive_json() == {"type": "force_mute"}
        update = host_socket.receive_json()
        assert update["type"] == "participant_updated"
        assert update["participant"]["id"] == guest["participant_id"]
        assert update["participant"]["audio"] is False


def test_guest_cannot_use_host_controls(api, room):
    host, guest = room

    with api.socket(host) as host_socket, api.socket(guest) as guest_socket:
        host_socket.receive_json()
        host_socket.receive_json()
        guest_socket.receive_json()

        for action in (
            {"type": "mute_all"},
            {"type": "remove_participant", "participant_id": host["participant_id"]},
            {"type": "end_meeting"},
        ):
            guest_socket.send_json(action)
            assert guest_socket.receive_json()["type"] == "error"

        # The host is still connected and the meeting is still running.
        guest_socket.send_json({"type": "chat", "text": "still here"})
        assert host_socket.receive_json()["type"] == "chat"


def test_host_can_remove_a_participant_who_then_cannot_return(client, api, room, db):
    host, guest = room

    with api.socket(host) as host_socket:
        host_socket.receive_json()
        with api.socket(guest) as guest_socket:
            guest_socket.receive_json()
            host_socket.receive_json()  # guest joined

            host_socket.send_json(
                {"type": "remove_participant", "participant_id": guest["participant_id"]}
            )

            assert guest_socket.receive_json() == {"type": "removed"}
            with pytest.raises(WebSocketDisconnect) as closed:
                guest_socket.receive_json()
            assert closed.value.code == CLOSE_REMOVED_BY_HOST

        left = host_socket.receive_json()
        assert left["type"] == "participant_left"
        assert left["participant_id"] == guest["participant_id"]
        assert left["reason"] == "removed"

    assert db.get(Participant, guest["participant_id"]).removed_at is not None
    with api.socket(guest) as retry:
        with pytest.raises(WebSocketDisconnect) as closed:
            retry.receive_json()
    assert closed.value.code == CLOSE_INVALID_SESSION


def test_host_ends_the_meeting_for_everyone(client, api, room, db):
    host, guest = room
    code = host["meeting"]["code"]

    with api.socket(host) as host_socket, api.socket(guest) as guest_socket:
        host_socket.receive_json()
        host_socket.receive_json()
        guest_socket.receive_json()

        host_socket.send_json({"type": "end_meeting"})

        for socket in (host_socket, guest_socket):
            assert socket.receive_json() == {"type": "meeting_ended"}
            with pytest.raises(WebSocketDisconnect) as closed:
                socket.receive_json()
            assert closed.value.code == CLOSE_MEETING_ENDED

    meeting = db.scalar(select(Meeting).where(Meeting.code == code))
    assert meeting.status == MeetingStatus.ENDED
    response = client.post(f"{API}/meetings/{code}/join", json={"display_name": "Late"})
    assert response.status_code == 409


def test_refreshing_the_page_replaces_the_old_connection(api, room):
    host, _guest = room

    with api.socket(host) as first:
        first.receive_json()
        with api.socket(host) as second:
            state = second.receive_json()
            assert names(state["participants"]) == ["Alex Morgan"]


def test_abandoned_instant_meeting_is_ended(api, session_factory, db):
    code = api.create_instant()["code"]

    asyncio.run(_end_if_abandoned(code, session_factory))

    meeting = db.scalar(select(Meeting).where(Meeting.code == code))
    assert meeting.status == MeetingStatus.ENDED


def test_empty_scheduled_meeting_is_left_open(api, session_factory, db):
    code = api.schedule()["code"]
    api.start(code)

    asyncio.run(_end_if_abandoned(code, session_factory))

    meeting = db.scalar(select(Meeting).where(Meeting.code == code))
    assert meeting.status == MeetingStatus.LIVE

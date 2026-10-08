"""In-memory registry of who is connected to which meeting room.

This holds the live state of running meetings: open WebSockets and each
person's microphone/camera status. It is deliberately not in the database:
it changes constantly and is meaningless once the meeting is over.

It lives in one Python process, so the API must run as a single worker.
Scaling to several workers would need a shared broker such as Redis pub/sub.
"""

from dataclasses import dataclass

from fastapi import WebSocket

from app.models import ParticipantRole

# WebSocket close codes in the 4000-4999 range are reserved for applications.
CLOSE_INVALID_SESSION = 4401
CLOSE_REMOVED_BY_HOST = 4403
CLOSE_REPLACED = 4409
CLOSE_MEETING_ENDED = 4410


@dataclass
class Connection:
    """One participant's open WebSocket plus their live media state."""

    websocket: WebSocket
    participant_id: int
    display_name: str
    role: ParticipantRole
    audio: bool = False
    video: bool = False
    screen: bool = False

    @property
    def is_host(self) -> bool:
        return self.role == ParticipantRole.HOST

    def to_public(self) -> dict:
        """The participant as other clients see them."""
        return {
            "id": self.participant_id,
            "display_name": self.display_name,
            "role": self.role.value,
            "audio": self.audio,
            "video": self.video,
            "screen": self.screen,
        }


class RoomRegistry:
    def __init__(self) -> None:
        # meeting code -> participant id -> connection
        self._rooms: dict[str, dict[int, Connection]] = {}

    def add(self, code: str, connection: Connection) -> Connection | None:
        """Register a connection. Returns the one it replaced, if any.

        The same participant connects again when they refresh the page; the
        newer socket wins and the caller closes the old one.
        """
        room = self._rooms.setdefault(code, {})
        replaced = room.get(connection.participant_id)
        room[connection.participant_id] = connection
        return replaced

    def remove(self, code: str, connection: Connection) -> bool:
        """Unregister a connection. Returns False if it was already replaced."""
        room = self._rooms.get(code)
        if room is None or room.get(connection.participant_id) is not connection:
            return False
        del room[connection.participant_id]
        if not room:
            del self._rooms[code]
        return True

    def get(self, code: str, participant_id: int) -> Connection | None:
        return self._rooms.get(code, {}).get(participant_id)

    def connections(self, code: str) -> list[Connection]:
        return list(self._rooms.get(code, {}).values())

    def is_empty(self, code: str) -> bool:
        return code not in self._rooms

    def clear(self, code: str) -> list[Connection]:
        """Drop a whole room and return the connections that were in it."""
        return list(self._rooms.pop(code, {}).values())

    async def send(self, connection: Connection, message: dict) -> None:
        try:
            await connection.websocket.send_json(message)
        except Exception:
            # The socket is already closing. Its own receive loop will see
            # the disconnect and clean up, so there is nothing to do here.
            pass

    async def broadcast(self, code: str, message: dict, *, exclude: int | None = None) -> None:
        for connection in self.connections(code):
            if connection.participant_id != exclude:
                await self.send(connection, message)

    async def close(self, connection: Connection, close_code: int, reason: str = "") -> None:
        try:
            await connection.websocket.close(code=close_code, reason=reason)
        except Exception:
            pass  # already closed


rooms = RoomRegistry()

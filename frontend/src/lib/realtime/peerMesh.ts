/**
 * Audio and video between browsers, using WebRTC.
 *
 * Every participant holds one direct connection to every other participant
 * (a "mesh"). Media never passes through our server; the server only relays
 * the small handshake messages ("signals") that let two browsers connect.
 *
 * The handshake between two people, A (already in the room) and B (joining):
 *   1. B calls A:  B creates an offer and sends it to A.
 *   2. A answers:  A creates an answer and sends it back.
 *   3. Both exchange ICE candidates: the network routes each could be reached on.
 * The newcomer always makes the call, so two people never call each other at
 * the same moment.
 *
 * A mesh suits small meetings. Each person uploads their video once per other
 * participant, so large meetings would need a media server (an SFU) instead.
 */

import { ICE_SERVERS } from "@/lib/config";
import type { SignalData } from "@/lib/types";

type MediaKind = "audio" | "video";
const MEDIA_KINDS: MediaKind[] = ["audio", "video"];

type Peer = {
  connection: RTCPeerConnection;
  /** Everything we receive from this participant. */
  stream: MediaStream;
  /** Candidates that arrived before the connection was ready for them. */
  pendingCandidates: RTCIceCandidateInit[];
};

type PeerMeshCallbacks = {
  sendSignal: (to: number, data: SignalData) => void;
  onStreamsChanged: (streams: Map<number, MediaStream>) => void;
};

export class PeerMesh {
  private readonly peers = new Map<number, Peer>();
  private readonly localTracks: Record<MediaKind, MediaStreamTrack | null> = {
    audio: null,
    video: null,
  };

  constructor(private readonly callbacks: PeerMeshCallbacks) {}

  /**
   * Set what we send to everyone: the microphone, the camera, the shared
   * screen, or nothing (null). `replaceTrack` swaps the media on a connection
   * that is already open, so no new handshake is needed.
   */
  setLocalTrack(kind: MediaKind, track: MediaStreamTrack | null): void {
    this.localTracks[kind] = track;
    for (const peer of this.peers.values()) {
      void this.senderFor(peer, kind)?.replaceTrack(track);
    }
  }

  /** Start a connection to someone who was already in the room. */
  async call(participantId: number): Promise<void> {
    const peer = this.createPeer(participantId);
    try {
      // Always set up an audio and a video channel, even with the camera
      // off. Turning it on later then only needs replaceTrack.
      for (const kind of MEDIA_KINDS) {
        const transceiver = peer.connection.addTransceiver(kind, { direction: "sendrecv" });
        await transceiver.sender.replaceTrack(this.localTracks[kind]);
      }
      await peer.connection.setLocalDescription(); // creates the offer
      this.sendDescription(participantId, peer);
    } catch (error) {
      console.warn("Could not call participant", participantId, error);
    }
  }

  /** Handle a handshake message relayed from another participant. */
  async handleSignal(from: number, data: SignalData): Promise<void> {
    try {
      if ("candidate" in data) {
        await this.addCandidate(from, data.candidate);
      } else if (data.description.type === "offer") {
        await this.answer(from, data.description);
      } else {
        await this.acceptAnswer(from, data.description);
      }
    } catch (error) {
      console.warn("Could not handle signal from participant", from, error);
    }
  }

  /** Drop the connection to someone who left. */
  remove(participantId: number): void {
    if (this.closePeer(participantId)) {
      this.publishStreams();
    }
  }

  closeAll(): void {
    for (const participantId of [...this.peers.keys()]) {
      this.closePeer(participantId);
    }
    this.publishStreams();
  }

  private async answer(from: number, offer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.createPeer(from);
    await peer.connection.setRemoteDescription(offer);
    await this.addPendingCandidates(peer);

    // The offer created one channel per media kind. Send our own tracks
    // back on those same channels.
    for (const transceiver of peer.connection.getTransceivers()) {
      const kind = transceiver.receiver.track.kind as MediaKind;
      transceiver.direction = "sendrecv";
      await transceiver.sender.replaceTrack(this.localTracks[kind]);
    }
    await peer.connection.setLocalDescription(); // creates the answer
    this.sendDescription(from, peer);
  }

  private async acceptAnswer(from: number, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(from);
    if (!peer) return;
    await peer.connection.setRemoteDescription(answer);
    await this.addPendingCandidates(peer);
  }

  private async addCandidate(from: number, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(from);
    if (!peer) return;
    // A candidate can only be added once the other side's description is
    // set. Candidates that arrive early wait in a queue.
    if (peer.connection.remoteDescription) {
      await peer.connection.addIceCandidate(candidate);
    } else {
      peer.pendingCandidates.push(candidate);
    }
  }

  private async addPendingCandidates(peer: Peer): Promise<void> {
    const candidates = peer.pendingCandidates.splice(0);
    for (const candidate of candidates) {
      await peer.connection.addIceCandidate(candidate);
    }
  }

  private createPeer(participantId: number): Peer {
    // Replace any earlier connection, e.g. after the other person refreshed.
    this.closePeer(participantId);

    const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const peer: Peer = { connection, stream: new MediaStream(), pendingCandidates: [] };

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.callbacks.sendSignal(participantId, { candidate: event.candidate.toJSON() });
      }
    };
    connection.ontrack = (event) => {
      peer.stream.addTrack(event.track);
      this.publishStreams();
    };

    this.peers.set(participantId, peer);
    return peer;
  }

  private closePeer(participantId: number): boolean {
    const peer = this.peers.get(participantId);
    if (!peer) return false;
    peer.connection.close();
    this.peers.delete(participantId);
    return true;
  }

  private sendDescription(to: number, peer: Peer): void {
    const description = peer.connection.localDescription;
    if (description) {
      this.callbacks.sendSignal(to, { description: description.toJSON() });
    }
  }

  private senderFor(peer: Peer, kind: MediaKind): RTCRtpSender | undefined {
    return peer.connection
      .getTransceivers()
      .find((transceiver) => transceiver.receiver.track.kind === kind)?.sender;
  }

  private publishStreams(): void {
    const streams = new Map<number, MediaStream>();
    for (const [participantId, peer] of this.peers) {
      streams.set(participantId, peer.stream);
    }
    this.callbacks.onStreamsChanged(streams);
  }
}

"use client";

import { useMusicPlayer } from "@/lib/MusicPlayerContext";
import { Track } from "@/lib/types";

const formatLabel: Record<Track["format"], string> = {
  vinyl: "record spinning",
  cassette: "tape rolling",
  cd: "disc playing",
};

export default function RoomNowPlaying({
  onOpenTrack,
}: {
  onOpenTrack: (track: Track) => void;
}) {
  const { currentTrack, isPlaying } = useMusicPlayer();

  if (!currentTrack) return null;

  return (
    <button
      type="button"
      className={`room-now-playing ${isPlaying ? "is-playing" : "is-paused"}`}
      onClick={() => onOpenTrack(currentTrack)}
      aria-label={`Open ${currentTrack.format} player for ${currentTrack.title}`}
    >
      <span className="room-now-playing-led" aria-hidden="true" />
      <span className="room-now-playing-copy">
        <small>{isPlaying ? formatLabel[currentTrack.format] : "music paused"}</small>
        <strong>{currentTrack.title}</strong>
        <em>{currentTrack.artist}</em>
      </span>
      <span className="room-now-playing-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

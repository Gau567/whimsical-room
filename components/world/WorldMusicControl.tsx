"use client";

import { useMusicPlayer } from "@/lib/MusicPlayerContext";

type MusicTrackLike = {
  title?: string;
  name?: string;
  artist?: string;
  format?: string;
};

type MusicPlayerLike = {
  currentTrack?: MusicTrackLike | null;
  isPlaying?: boolean;
  togglePlayPause?: () => void;
  togglePlayback?: () => void;
  pause?: () => void;
  play?: () => void;
  resume?: () => void;
};

export default function WorldMusicControl() {
  const player = useMusicPlayer() as unknown as MusicPlayerLike;
  const track = player.currentTrack ?? null;
  const isPlaying = Boolean(player.isPlaying);

  function toggleMusic() {
    if (player.togglePlayPause) {
      player.togglePlayPause();
      return;
    }

    if (player.togglePlayback) {
      player.togglePlayback();
      return;
    }

    if (isPlaying) {
      player.pause?.();
      return;
    }

    const playAction = player.play ?? player.resume;
    playAction?.();
  }

  if (!track) {
    return (
      <div className="world-music-mini is-idle" aria-label="No room music selected">
        <span className="world-music-disc" aria-hidden="true">♪</span>
        <div>
          <small>ROOM MUSIC</small>
          <strong>nothing playing</strong>
        </div>
      </div>
    );
  }

  const title = track.title ?? track.name ?? "unknown track";

  return (
    <div className={`world-music-mini ${isPlaying ? "is-playing" : "is-paused"}`}>
      <span className="world-music-disc" aria-hidden="true">●</span>
      <div className="world-music-copy">
        <small>{isPlaying ? "PLAYING FROM ROOM 01" : "MUSIC PAUSED"}</small>
        <strong>{title}</strong>
        {track.artist && <span>{track.artist}</span>}
      </div>
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? "Pause room music" : "Play room music"}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "Ⅱ" : "▶"}
      </button>
    </div>
  );
}

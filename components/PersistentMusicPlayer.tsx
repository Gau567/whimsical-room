"use client";

import { formatTime } from "@/lib/useYouTubePlayer";
import { useMusicPlayer } from "@/lib/MusicPlayerContext";
import { Track } from "@/lib/types";

const formatIcon: Record<Track["format"], string> = {
  vinyl: "●",
  cassette: "▣",
  cd: "◉",
};

export default function PersistentMusicPlayer({
  onOpenTrack,
}: {
  onOpenTrack: (track: Track) => void;
}) {
  const {
    currentTrack,
    status,
    currentTime,
    duration,
    isPlaying,
    play,
    pause,
    eject,
  } = useMusicPlayer();

  if (!currentTrack) return null;

  const disabled = status === "loading" || status === "error";
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <aside className="persistent-music-player" aria-label="Now playing">
      <button
        type="button"
        className="persistent-media-button"
        onClick={() => onOpenTrack(currentTrack)}
        aria-label={`Open ${currentTrack.format} player for ${currentTrack.title}`}
      >
        <span
          className={`persistent-media-icon persistent-media-${currentTrack.format}`}
          style={{ ["--track-accent" as string]: currentTrack.color }}
          aria-hidden="true"
        >
          {formatIcon[currentTrack.format]}
        </span>
        <span className="persistent-track-copy">
          <strong>{currentTrack.title}</strong>
          <small>
            {currentTrack.artist} · {currentTrack.format}
          </small>
        </span>
      </button>

      <div className="persistent-progress-block">
        <div className="persistent-time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{status === "error" ? "playback error" : formatTime(duration)}</span>
        </div>
        <div className="persistent-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="persistent-player-actions">
        <button
          type="button"
          className="persistent-play-button"
          onClick={() => (isPlaying ? pause() : play())}
          disabled={disabled}
          aria-label={isPlaying ? "Pause current song" : "Play current song"}
        >
          {isPlaying ? "❙❙" : "▶"}
        </button>
        <button
          type="button"
          className="persistent-stop-button"
          onClick={eject}
          aria-label="Stop music and eject"
          title="Stop and eject"
        >
          ×
        </button>
      </div>
    </aside>
  );
}

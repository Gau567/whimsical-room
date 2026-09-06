"use client";

import { useMusicPlayer } from "@/lib/MusicPlayerContext";
import { Track } from "@/lib/types";

export default function RoomSpeaker({
  onOpenTrack,
}: {
  onOpenTrack: (track: Track) => void;
}) {
  const {
    currentTrack,
    status,
    isPlaying,
    play,
    pause,
    eject,
  } = useMusicPlayer();

  const disabled = !currentTrack || status === "loading" || status === "error";

  return (
    <aside
      className={`room-speaker-console ${isPlaying ? "speaker-is-playing" : ""}`}
      aria-label="Room stereo speaker"
    >
      <div className="speaker-cabinet" aria-hidden="true">
        <span className="speaker-grille" />
        <span className="speaker-cone speaker-cone-top"><i /></span>
        <span className="speaker-cone speaker-cone-bottom"><i /></span>
        <span className="speaker-led" />
      </div>

      <div className="speaker-controls">
        <div className="speaker-display">
          <small>ROOM STEREO</small>
          <strong>{currentTrack ? currentTrack.title : "NO DISC"}</strong>
          <span>{currentTrack ? currentTrack.artist : "choose a song first"}</span>
        </div>

        <div className="speaker-buttons">
          <button
            type="button"
            onClick={() => (isPlaying ? pause() : play())}
            disabled={disabled}
            aria-label={isPlaying ? "Pause room music" : "Play room music"}
          >
            {isPlaying ? "❙❙" : "▶"}
          </button>

          <button
            type="button"
            onClick={() => currentTrack && onOpenTrack(currentTrack)}
            disabled={!currentTrack}
            aria-label="Open the current record, CD, or cassette player"
          >
            OPEN
          </button>

          <button
            type="button"
            onClick={eject}
            disabled={!currentTrack}
            aria-label="Stop and eject the current song"
          >
            ■
          </button>
        </div>
      </div>
    </aside>
  );
}

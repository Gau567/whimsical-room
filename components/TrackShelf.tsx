"use client";

import { Track } from "@/lib/types";
import DraggableTrack from "./DraggableTrack";
import { useMusicPlayer } from "@/lib/MusicPlayerContext";

export default function TrackShelf({
  title,
  tracks,
  physical = false,
}: {
  title: string;
  tracks: Track[];
  physical?: boolean;
}) {
  const { currentTrack } = useMusicPlayer();
  const format = tracks[0]?.format ?? "cassette";

  if (!physical) {
    return (
      <div className="w-full">
        <p className="mb-2 font-hand text-lg text-paper/80">{title}</p>
        <div className="flex flex-col gap-2 rounded-lg border border-black/30 bg-walnut-900/60 p-2.5 shadow-inset">
          {tracks.map((track) => (
            <DraggableTrack key={track.id} track={track} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`physical-collection physical-collection-${format}`}>
      <div className="physical-collection-heading">
        <div>
          <p className="physical-collection-title">{title}</p>
          <span className="physical-collection-count">
            {tracks.length} {format === "vinyl" ? "records" : format === "cd" ? "discs" : "tapes"}
          </span>
        </div>
        <span className="physical-collection-action">click or drag to play</span>
      </div>

      {format === "vinyl" && (
        <div className="vinyl-crate-shell">
          <div className="vinyl-crate-back" aria-hidden="true" />
          <div className="physical-track-grid physical-vinyl" role="list" aria-label="Vinyl record crate">
            {tracks.map((track, index) => (
              <DraggableTrack
                key={track.id}
                track={track}
                physical
                index={index}
                active={currentTrack?.id === track.id}
              />
            ))}
          </div>
          <div className="vinyl-crate-front" aria-hidden="true">
            <span>RECORDS</span>
            <small>33⅓ RPM</small>
          </div>
        </div>
      )}

      {format === "cassette" && (
        <div className="cassette-drawer-shell">
          <div className="cassette-drawer-handle" aria-hidden="true"><span /></div>
          <div className="physical-track-grid physical-cassette" role="list" aria-label="Cassette tape drawer">
            {tracks.map((track, index) => (
              <DraggableTrack
                key={track.id}
                track={track}
                physical
                index={index}
                active={currentTrack?.id === track.id}
              />
            ))}
          </div>
          <div className="cassette-drawer-label" aria-hidden="true">TAPE DRAWER · SIDE A / SIDE B</div>
        </div>
      )}

      {format === "cd" && (
        <div className="cd-rack-shell">
          <div className="cd-rack-top" aria-hidden="true" />
          <div className="physical-track-grid physical-cd" role="list" aria-label="Compact disc rack">
            {tracks.map((track, index) => (
              <DraggableTrack
                key={track.id}
                track={track}
                physical
                index={index}
                active={currentTrack?.id === track.id}
              />
            ))}
          </div>
          <div className="cd-rack-base" aria-hidden="true"><span>COMPACT DISC ARCHIVE</span></div>
        </div>
      )}
    </div>
  );
}

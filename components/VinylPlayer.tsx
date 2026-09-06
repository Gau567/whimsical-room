"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useEffect, useRef } from "react";
import { Track } from "@/lib/types";
import { formatTime } from "@/lib/useYouTubePlayer";
import { useMusicPlayer } from "@/lib/MusicPlayerContext";
import { useSpin } from "@/lib/motion";

export default function VinylPlayer({ initialTrack }: { initialTrack?: Track | null }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "vinyl-slot",
    data: { format: "vinyl" },
  });

  const {
    currentTrack,
    status,
    currentTime,
    duration,
    isPlaying,
    loadTrack,
    play,
    pause,
    eject,
  } = useMusicPlayer();

  const track = currentTrack?.format === "vinyl" ? currentTrack : null;

  useEffect(() => {
    if (!initialTrack || initialTrack.format !== "vinyl") return;
    if (currentTrack?.id === initialTrack.id) return;
    loadTrack(initialTrack);
  }, [initialTrack, currentTrack?.id, loadTrack]);

  useDndMonitor({
    onDragEnd(event) {
      if (event.over?.id !== "vinyl-slot") return;
      const dropped = event.active.data.current?.track as Track | undefined;
      if (dropped?.format === "vinyl") loadTrack(dropped);
    },
  });

  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className="vinyl-player-wrap">
      <div
        ref={setNodeRef}
        className={`vinyl-player ${isOver ? "vinyl-player-over" : ""}`}
      >
        <p className="vinyl-player-brand">NOSTALGIA HI-FI</p>

        <div className="turntable-bed">
          <Record track={track} spinning={isPlaying && Boolean(track)} />
          <div className={`tonearm ${track ? "tonearm-on" : ""}`}>
            <span className="tonearm-pivot" />
            <span className="tonearm-arm" />
            <span className="tonearm-head" />
          </div>

          {!track && <p className="turntable-drop">drop a record here</p>}
        </div>

        <div className="vinyl-readout">
          <div>
            <p>{track ? track.title : "no record"}</p>
            <span>{track ? track.artist : "—"}</span>
          </div>
          <span>
            {track ? `${formatTime(currentTime)} / ${formatTime(duration)}` : "0:00"}
          </span>
        </div>

        <div className="vinyl-controls">
          <button
            type="button"
            onClick={() => (isPlaying ? pause() : play())}
            disabled={!track || isLoading || hasError}
          >
            {isPlaying ? "❙❙" : "▶"}
          </button>
          <button type="button" onClick={eject} disabled={!track}>
            LIFT
          </button>
        </div>
      </div>
    </div>
  );
}

function Record({ track, spinning }: { track: Track | null; spinning: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSpin(ref as React.RefObject<HTMLElement>, spinning, 3.8);

  return (
    <div
      ref={ref}
      className={`turntable-record ${track ? "record-loaded" : ""}`}
      style={
        track
          ? {
              background: `repeating-radial-gradient(circle, #151214 0 3px, #211d20 4px 6px)`,
            }
          : undefined
      }
    >
      {track && (
        <span className="record-label" style={{ backgroundColor: track.color }}>
          <small>{track.title}</small>
        </span>
      )}
    </div>
  );
}

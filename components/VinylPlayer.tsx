"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { Track } from "@/lib/types";
import { formatTime, useYouTubePlayer } from "@/lib/useYouTubePlayer";
import { useSpin } from "@/lib/motion";

export default function VinylPlayer({ initialTrack }: { initialTrack?: Track | null }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "vinyl-slot",
    data: { format: "vinyl" },
  });
  const [track, setTrack] = useState<Track | null>(initialTrack ?? null);

  const { status, currentTime, duration, load, play, pause } =
    useYouTubePlayer("vinyl-yt-engine");

  useEffect(() => {
    if (initialTrack?.format && initialTrack.format === "vinyl" && initialTrack.id !== track?.id) {
      setTrack(initialTrack);
    }
  }, [initialTrack, track?.id]);

  useDndMonitor({
    onDragEnd(event) {
      if (event.over?.id !== "vinyl-slot") return;
      const dropped = event.active.data.current?.track as Track | undefined;
      if (dropped?.format === "vinyl") setTrack(dropped);
    },
  });

  useEffect(() => {
    if (!track?.youtubeId) return;
    load(track.youtubeId);
  }, [track, load]);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <div className="vinyl-player-wrap">
      <div
        id="vinyl-yt-engine"
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px]"
      />

      <div
        ref={setNodeRef}
        className={`vinyl-player ${isOver ? "vinyl-player-over" : ""}`}
      >
        <p className="vinyl-player-brand">NOSTALGIA HI-FI</p>

        <div className="turntable-bed">
          <Record track={track} spinning={isPlaying} />
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
          <button
            type="button"
            onClick={() => {
              pause();
              setTrack(null);
            }}
            disabled={!track}
          >
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

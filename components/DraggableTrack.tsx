"use client";

import { useDraggable } from "@dnd-kit/core";
import { Track } from "@/lib/types";

export default function DraggableTrack({
  track,
  physical = false,
}: {
  track: Track;
  physical?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: track.id,
    data: { track },
  });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : {};

  if (physical) {
    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        type="button"
        className={`physical-track physical-track-${track.format} ${
          isDragging ? "physical-dragging" : ""
        }`}
      >
        {track.format === "cassette" && (
          <>
            <span className="cassette-shell" style={{ backgroundColor: track.color }}>
              <span className="cassette-label">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span className="cassette-window">
                <span className="cassette-reel" />
                <span className="cassette-tape" />
                <span className="cassette-reel" />
              </span>
              <span className="cassette-screws">•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•</span>
            </span>
          </>
        )}

        {track.format === "cd" && (
          <>
            <span
              className="compact-disc"
              style={{
                background: `conic-gradient(from 45deg, #eef2f4, ${track.color}, #d7e5e8, #fbf1e6, ${track.color}, #eef2f4)`,
              }}
            >
              <span className="cd-ring" />
              <span className="cd-hole" />
              <span className="cd-title">{track.title}</span>
            </span>
            <span className="physical-caption">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </span>
          </>
        )}

        {track.format === "vinyl" && (
          <>
            <span className="record-sleeve" style={{ backgroundColor: track.color }}>
              <span className="sleeve-art">✦</span>
              <span className="sleeve-copy">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span className="peek-record">
                <span className="peek-label" />
              </span>
            </span>
          </>
        )}
      </button>
    );
  }

  const sharedClasses = `group relative w-full text-left rounded-md border border-black/20 bg-walnut-800 px-3 py-2.5 shadow-inset cursor-grab active:cursor-grabbing touch-none transition-opacity ${
    isDragging ? "opacity-30" : "opacity-100 hover:brightness-110"
  }`;

  if (track.format === "cassette") {
    return (
      <button ref={setNodeRef} {...listeners} {...attributes} style={style} className={sharedClasses}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-6 w-9 shrink-0 items-center justify-around rounded-sm border border-black/30 px-1"
            style={{ backgroundColor: track.color }}
          >
            <span className="h-2.5 w-2.5 rounded-full border border-black/30 bg-walnut-950/70" />
            <span className="h-2.5 w-2.5 rounded-full border border-black/30 bg-walnut-950/70" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] uppercase tracking-wide text-cream">{track.title}</p>
            <p className="truncate font-hand text-sm leading-none text-paper/70">{track.artist}</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button ref={setNodeRef} {...listeners} {...attributes} style={style} className={sharedClasses}>
      <div className="flex items-center gap-2.5">
        <div
          className="relative h-7 w-7 shrink-0 rounded-full border border-black/30"
          style={{
            background: `conic-gradient(from 90deg, #cfd8e3, ${track.color}, #cfd8e3, #eef2f6, ${track.color})`,
          }}
        >
          <span className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-walnut-950" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] uppercase tracking-wide text-cream">{track.title}</p>
          <p className="truncate font-hand text-sm leading-none text-paper/70">{track.artist}</p>
        </div>
      </div>
    </button>
  );
}

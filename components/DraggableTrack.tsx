"use client";

import { useDraggable } from "@dnd-kit/core";
import { Track } from "@/lib/types";
import { useMusicPlayer } from "@/lib/MusicPlayerContext";

export default function DraggableTrack({
  track,
  physical = false,
  index = 0,
  active = false,
}: {
  track: Track;
  physical?: boolean;
  index?: number;
  active?: boolean;
}) {
  const { loadTrack } = useMusicPlayer();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: track.id,
    data: { track },
  });

  const style: React.CSSProperties = {
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 50,
        }
      : {}),
    ["--track-color" as string]: track.color,
    ["--track-index" as string]: index,
  };

  const handleClick = () => {
    if (isDragging) return;
    loadTrack(track);
  };

  if (physical) {
    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        type="button"
        onClick={handleClick}
        role="listitem"
        aria-label={`Load ${track.title} by ${track.artist}`}
        className={`physical-track physical-track-${track.format} ${
          isDragging ? "physical-dragging" : ""
        } ${active ? "physical-track-active" : ""}`}
      >
        {track.format === "cassette" && (
          <span className="tape-drawer-item" style={{ backgroundColor: track.color }}>
            <span className="tape-spine-tab" />
            <span className="tape-spine-copy">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </span>
            <span className="tape-spine-reels" aria-hidden="true">
              <i /><b /><i />
            </span>
            <span className="tape-pull-word">PULL</span>
          </span>
        )}

        {track.format === "cd" && (
          <span className="jewel-case" style={{ backgroundColor: track.color }}>
            <span className="jewel-spine">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </span>
            <span className="jewel-cover">
              <span className="jewel-disc" aria-hidden="true">
                <i />
              </span>
              <span className="jewel-cover-copy">
                <b>{track.title}</b>
                <em>{track.artist}</em>
              </span>
            </span>
          </span>
        )}

        {track.format === "vinyl" && (
          <span className="crate-record-wrap">
            <span className="record-sleeve record-sleeve-v19" style={{ backgroundColor: track.color }}>
              <span className="sleeve-art">✦</span>
              <span className="sleeve-copy">
                <strong>{track.title}</strong>
                <small>{track.artist}</small>
              </span>
              <span className="peek-record">
                <span className="peek-label" />
              </span>
            </span>
            <span className="record-spine-label">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </span>
          </span>
        )}

        {active && <span className="physical-now-playing">NOW PLAYING</span>}
      </button>
    );
  }

  const sharedClasses = `group relative w-full text-left rounded-md border border-black/20 bg-walnut-800 px-3 py-2.5 shadow-inset cursor-grab active:cursor-grabbing touch-none transition-opacity ${
    isDragging ? "opacity-30" : "opacity-100 hover:brightness-110"
  }`;

  if (track.format === "cassette") {
    return (
      <button ref={setNodeRef} {...listeners} {...attributes} style={style} onClick={handleClick} className={sharedClasses}>
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
    <button ref={setNodeRef} {...listeners} {...attributes} style={style} onClick={handleClick} className={sharedClasses}>
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

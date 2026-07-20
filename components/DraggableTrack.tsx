"use client";

import { useDraggable } from "@dnd-kit/core";
import { Track } from "@/lib/types";

export default function DraggableTrack({ track }: { track: Track }) {
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

  if (track.format === "cassette") {
    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={`group relative w-full text-left rounded-md border border-black/20 bg-walnut-800 px-3 py-2.5 shadow-inset cursor-grab active:cursor-grabbing touch-none transition-opacity ${
          isDragging ? "opacity-30" : "opacity-100 hover:brightness-110"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-6 w-9 shrink-0 rounded-sm border border-black/30 flex items-center justify-around px-1"
            style={{ backgroundColor: track.color }}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-walnut-950/70 border border-black/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-walnut-950/70 border border-black/30" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] uppercase tracking-wide text-cream">
              {track.title}
            </p>
            <p className="truncate font-hand text-sm text-paper/70 leading-none">{track.artist}</p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`group relative w-full text-left rounded-md border border-black/20 bg-walnut-800 px-3 py-2.5 shadow-inset cursor-grab active:cursor-grabbing touch-none transition-opacity ${
        isDragging ? "opacity-30" : "opacity-100 hover:brightness-110"
      }`}
    >
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
          <p className="truncate font-mono text-[11px] uppercase tracking-wide text-cream">
            {track.title}
          </p>
          <p className="truncate font-hand text-sm text-paper/70 leading-none">{track.artist}</p>
        </div>
      </div>
    </button>
  );
}

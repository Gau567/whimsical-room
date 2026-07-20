"use client";

import { Track } from "@/lib/types";
import DraggableTrack from "./DraggableTrack";

export default function TrackShelf({ title, tracks }: { title: string; tracks: Track[] }) {
  return (
    <div className="w-full">
      <p className="mb-2 font-hand text-lg text-paper/80">{title}</p>
      <div className="flex flex-col gap-2 rounded-lg border border-black/30 bg-walnut-900/60 p-2.5 shadow-inset">
        {tracks.map((t) => (
          <DraggableTrack key={t.id} track={t} />
        ))}
      </div>
    </div>
  );
}

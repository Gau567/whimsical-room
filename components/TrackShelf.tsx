"use client";

import { Track } from "@/lib/types";
import DraggableTrack from "./DraggableTrack";

export default function TrackShelf({
  title,
  tracks,
  physical = false,
}: {
  title: string;
  tracks: Track[];
  physical?: boolean;
}) {
  return (
    <div className={physical ? "physical-collection" : "w-full"}>
      <p className={physical ? "physical-collection-title" : "mb-2 font-hand text-lg text-paper/80"}>
        {title}
      </p>
      <div
        className={
          physical
            ? `physical-track-grid physical-${tracks[0]?.format ?? "cassette"}`
            : "flex flex-col gap-2 rounded-lg border border-black/30 bg-walnut-900/60 p-2.5 shadow-inset"
        }
      >
        {tracks.map((track) => (
          <DraggableTrack key={track.id} track={track} physical={physical} />
        ))}
      </div>
    </div>
  );
}

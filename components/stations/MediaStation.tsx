"use client";

import { MediaFormat, Track } from "@/lib/types";
import TrackShelf from "@/components/TrackShelf";
import CassettePlayer from "@/components/CassettePlayer";
import CDPlayer from "@/components/CDPlayer";
import VinylPlayer from "@/components/VinylPlayer";

const copy: Record<MediaFormat, { eyebrow: string; title: string; hint: string }> = {
  cassette: {
    eyebrow: "side a / side b",
    title: "cassette corner",
    hint: "pick up a tape and drag it into the Walkman",
  },
  cd: {
    eyebrow: "compact disc archive",
    title: "CD corner",
    hint: "drag a disc into the Discman",
  },
  vinyl: {
    eyebrow: "33⅓ rpm",
    title: "record corner",
    hint: "pull a record from its sleeve and place it on the turntable",
  },
};

export default function MediaStation({
  format,
  tracks,
  onBack,
}: {
  format: MediaFormat;
  tracks: Track[];
  onBack: () => void;
}) {
  const text = copy[format];

  return (
    <section className={`station station-${format}`}>
      <button type="button" className="station-back" onClick={onBack}>
        ← back to shelf
      </button>

      <header className="station-header">
        <p>{text.eyebrow}</p>
        <h2>{text.title}</h2>
        <span>{text.hint}</span>
      </header>

      <div className="station-grid">
        <div className="station-collection">
          <TrackShelf title="your collection" tracks={tracks} physical />
        </div>

        <div className="station-player">
          {format === "cassette" && <CassettePlayer />}
          {format === "cd" && <CDPlayer />}
          {format === "vinyl" && <VinylPlayer />}
        </div>
      </div>
    </section>
  );
}

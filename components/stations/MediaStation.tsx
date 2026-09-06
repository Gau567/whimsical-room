"use client";

import { MediaFormat, Track } from "@/lib/types";
import TrackShelf from "@/components/TrackShelf";
import CassettePlayer from "@/components/CassettePlayer";
import CDPlayer from "@/components/CDPlayer";
import VinylPlayer from "@/components/VinylPlayer";

const copy: Record<MediaFormat, { eyebrow: string; title: string; hint: string; collection: string }> = {
  cassette: {
    eyebrow: "side a / side b",
    title: "tape drawer",
    hint: "pull out a cassette — click it or drag it into the Walkman",
    collection: "your tape drawer",
  },
  cd: {
    eyebrow: "compact disc archive",
    title: "CD rack",
    hint: "choose a jewel case — click it or drag the disc into the player",
    collection: "your CD rack",
  },
  vinyl: {
    eyebrow: "33⅓ rpm",
    title: "record corner",
    hint: "flip through the crate — click a sleeve or drag it to the turntable",
    collection: "your record crate",
  },
};

export default function MediaStation({
  format,
  tracks,
  initialTrack,
  onBack,
}: {
  format: MediaFormat;
  tracks: Track[];
  initialTrack?: Track | null;
  onBack: () => void;
}) {
  const text = copy[format];

  return (
    <section className={`station station-${format} station-v19`}>
      <button type="button" className="station-back" onClick={onBack}>
        ← back to shelf
      </button>

      <header className="station-header station-header-v19">
        <p>{text.eyebrow}</p>
        <h2>{text.title}</h2>
        <span>{initialTrack ? `memory loaded: ${initialTrack.title}` : text.hint}</span>
      </header>

      {initialTrack && (
        <div className="memory-loaded-banner">
          <span>♫ memory soundtrack</span>
          <strong>{initialTrack.title}</strong>
          <small>{initialTrack.artist} · {initialTrack.format}</small>
        </div>
      )}

      <div className={`station-grid station-grid-v19 station-grid-${format}-v19`}>
        <div className="station-collection station-collection-v19">
          <TrackShelf title={text.collection} tracks={tracks} physical />
        </div>

        <div className="station-player station-player-v19">
          <div className="station-player-label">
            <span>{format === "vinyl" ? "TURNTABLE" : format === "cd" ? "DISC PLAYER" : "WALKMAN"}</span>
            <small>now playing</small>
          </div>
          {format === "cassette" && <CassettePlayer initialTrack={initialTrack} />}
          {format === "cd" && <CDPlayer initialTrack={initialTrack} />}
          {format === "vinyl" && <VinylPlayer initialTrack={initialTrack} />}
        </div>
      </div>
    </section>
  );
}

"use client";

import { DndContext } from "@dnd-kit/core";
import CassettePlayer from "@/components/CassettePlayer";
import CDPlayer from "@/components/CDPlayer";
import TrackShelf from "@/components/TrackShelf";
import { cassettes, cds } from "@/data/tracks";

export default function Home() {
  return (
    <DndContext>
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-14">
        <header className="mb-12 text-center">
          <p className="font-hand text-2xl text-amber-400">a little desk of</p>
          <h1 className="font-mono text-3xl font-semibold uppercase tracking-[0.2em] text-cream">
            Tapes &amp; Discs
          </h1>
          <p className="mt-3 font-serif text-sm text-paper/50">
            drag a tape into the walkman, or a disc into the player. press ▶.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="order-2 md:order-1">
            <TrackShelf title="on the shelf — tapes" tracks={cassettes} />
          </div>

          <div className="order-1 flex flex-col items-center gap-10 md:order-2">
            <CassettePlayer />
            <CDPlayer />
          </div>

          <div className="order-3">
            <TrackShelf title="on the rack — CDs" tracks={cds} />
          </div>
        </div>
      </main>
    </DndContext>
  );
}

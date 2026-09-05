"use client";

import { DndContext } from "@dnd-kit/core";
import CassettePlayer from "@/components/CassettePlayer";
import CDPlayer from "@/components/CDPlayer";
import TrackShelf from "@/components/TrackShelf";
import { cassettes, cds } from "@/data/tracks";

export default function Home() {
  return (
    <DndContext>
      <main className="room">
        <div className="room-overlay" />

        <header className="room-title">
          <p className="font-hand text-2xl text-amber-300">
            welcome to
          </p>

          <h1 className="font-mono text-3xl font-semibold uppercase tracking-[0.2em] text-cream">
            The Nostalgia Room
          </h1>

          <p className="mt-2 font-serif text-sm text-paper/60">
            Pick a tape or disc and drag it into a player.
          </p>
        </header>

        <section className="window-area">
          <div className="window">
            <div className="window-sky">
              <span className="moon">☾</span>
              <span className="star star-one">✦</span>
              <span className="star star-two">✧</span>
              <span className="star star-three">✦</span>
            </div>

            <div className="window-frame-horizontal" />
            <div className="window-frame-vertical" />
          </div>

          <div className="window-sill">
            <span className="plant">🪴</span>
          </div>
        </section>

        <section className="wall-decor">
          <div className="polaroid rotate-left">
            <div className="photo photo-one" />
            <p>summer</p>
          </div>

          <div className="polaroid rotate-right">
            <div className="photo photo-two" />
            <p>you & me</p>
          </div>
        </section>

        <section className="left-shelf room-panel">
          <TrackShelf
            title="cassette collection"
            tracks={cassettes}
          />
        </section>

        <section className="right-shelf room-panel">
          <TrackShelf
            title="CD collection"
            tracks={cds}
          />
        </section>

        <section className="desk-area">
          <div className="desk-top">
            <div className="desk-decoration desk-books">
              <span>📚</span>
            </div>

            <div className="players">
              <CassettePlayer />
              <CDPlayer />
            </div>

            <div className="desk-decoration">
              <span className="lamp">💡</span>
              <span className="mug">☕</span>
            </div>
          </div>

          <div className="desk-drawer">
            <div className="drawer-handle" />
          </div>

          <div className="desk-leg desk-leg-left" />
          <div className="desk-leg desk-leg-right" />
        </section>

        <section className="floor-items">
          <div className="floor-cushion">🧸</div>
          <div className="floor-records">♫</div>
        </section>
      </main>
    </DndContext>
  );
}
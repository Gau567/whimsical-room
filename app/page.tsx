"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import MediaShelf from "@/components/room/MediaShelf";
import MediaStation from "@/components/stations/MediaStation";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { MediaFormat } from "@/lib/types";

type RoomView = "shelf" | MediaFormat | "books";

export default function Home() {
  const [view, setView] = useState<RoomView>("shelf");
  const [lampOn, setLampOn] = useState(true);

  const tracks = view === "cassette" ? cassettes : view === "cd" ? cds : vinyls;

  return (
    <DndContext>
      <main className={`nostalgia-room ${lampOn ? "room-lit" : "room-dim"}`}>
        <div className="ambient-grain" />

        <header className="room-heading">
          <div>
            <p>welcome to</p>
            <h1>The Nostalgia Room</h1>
            <span>
              {view === "shelf"
                ? "choose something from the shelf"
                : view === "books"
                  ? "a few things worth keeping"
                  : "pick something up, drag it over, press play"}
            </span>
          </div>

          <button
            type="button"
            className={`room-lamp ${lampOn ? "lamp-is-on" : ""}`}
            onClick={() => setLampOn((value) => !value)}
            aria-label="Toggle room lamp"
            aria-pressed={lampOn}
          >
            <span>●</span>
          </button>
        </header>

        <div className="room-window" aria-hidden="true">
          <div className="window-night">
            <span className="window-moon">☾</span>
            <span className="window-star star-a">✦</span>
            <span className="window-star star-b">·</span>
            <span className="window-star star-c">✧</span>
          </div>
          <span className="window-cross window-cross-v" />
          <span className="window-cross window-cross-h" />
        </div>

        <div className="room-content">
          {view === "shelf" && <MediaShelf onSelect={setView} />}

          {(view === "cassette" || view === "cd" || view === "vinyl") && (
            <MediaStation format={view} tracks={tracks} onBack={() => setView("shelf")} />
          )}

          {view === "books" && (
            <section className="book-view">
              <button type="button" className="station-back" onClick={() => setView("shelf")}>
                ← back to shelf
              </button>

              <div className="open-journal">
                <div className="journal-page journal-left-page">
                  <p className="journal-date">SEPTEMBER</p>
                  <h2>things worth remembering</h2>
                  <p>
                    There are songs that become places, and ordinary afternoons that somehow become
                    permanent. This shelf is for those.
                  </p>
                  <span className="journal-doodle">✦ &nbsp; ☾ &nbsp; ♫</span>
                </div>

                <div className="journal-page journal-right-page">
                  <div className="journal-photo" />
                  <p className="journal-handwriting">
                    “play this when the room feels a little too quiet.”
                  </p>
                  <div className="journal-tape">for later</div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </DndContext>
  );
}

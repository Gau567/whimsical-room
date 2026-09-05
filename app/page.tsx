"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import RetroRoomScene from "@/components/room/RetroRoomScene";
import RetroComputer from "@/components/room/RetroComputer";
import DeskDrawer from "@/components/room/DeskDrawer";
import MediaStation from "@/components/stations/MediaStation";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { MediaFormat } from "@/lib/types";

type RoomView = "room" | MediaFormat | "books" | "computer";

export default function Home() {
  const [view, setView] = useState<RoomView>("room");
  const [lampOn, setLampOn] = useState(true);
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);

  const tracks = view === "cassette" ? cassettes : view === "cd" ? cds : vinyls;
  const mediaOpen = view === "cassette" || view === "cd" || view === "vinyl";

  return (
    <DndContext>
      <main className={`nostalgia-room retro-room-page ${lampOn ? "room-lit" : "room-dim"}`}>
        <div className="ambient-grain" />

        {view === "room" && (
          <>
            <header className="retro-room-title">
              <p>welcome to</p>
              <h1>The Nostalgia Room</h1>
              <span>click around — almost everything has a story</span>
            </header>

            <RetroRoomScene
              onSelect={setView}
              lampOn={lampOn}
              onToggleLamp={() => setLampOn((value) => !value)}
              onOpenDrawer={setOpenDrawer}
            />
          </>
        )}

        {mediaOpen && (
          <div className="retro-focus-shell">
            <MediaStation format={view} tracks={tracks} onBack={() => setView("room")} />
          </div>
        )}

        {view === "books" && (
          <section className="retro-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>

            <div className="open-journal retro-journal">
              <div className="journal-page journal-left-page">
                <p className="journal-date">SEPTEMBER</p>
                <h2>things worth remembering</h2>
                <p>
                  Some songs become places. Some photos become entire afternoons. This is where the
                  little things live when you do not want them to disappear.
                </p>
                <span className="journal-doodle">✦ &nbsp; ☾ &nbsp; ♫ &nbsp; ♡</span>
                <div className="journal-ticket">ADMIT ONE · GOOD MEMORIES</div>
              </div>

              <div className="journal-page journal-right-page">
                <div className="journal-photo retro-journal-photo" />
                <p className="journal-handwriting">
                  “play this when the room feels a little too quiet.”
                </p>
                <div className="journal-tape">for later</div>
                <div className="journal-sticker">☺</div>
              </div>
            </div>
          </section>
        )}

        {openDrawer !== null && view === "room" && (
          <section className="retro-modal-shell drawer-shell">
            <button type="button" className="station-back" onClick={() => setOpenDrawer(null)}>
              ← close drawer
            </button>
            <DeskDrawer drawer={openDrawer} onClose={() => setOpenDrawer(null)} />
          </section>
        )}

        {view === "computer" && (
          <section className="retro-modal-shell computer-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>

            <RetroComputer onBack={() => setView("room")} />
          </section>
        )}
      </main>
    </DndContext>
  );
}

"use client";

import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import RetroRoomScene from "@/components/room/RetroRoomScene";
import RetroComputer from "@/components/room/RetroComputer";
import DeskDrawer from "@/components/room/DeskDrawer";
import TypableJournal from "@/components/room/TypableJournal";
import ReadableBooks from "@/components/room/ReadableBooks";
import MiniTypewriter from "@/components/room/MiniTypewriter";
import PinBoard from "@/components/room/PinBoard";
import MediaStation from "@/components/stations/MediaStation";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { MediaFormat, Track } from "@/lib/types";

type RoomView = "room" | MediaFormat | "journal" | "books" | "computer" | "typewriter" | "pinboard";

export default function Home() {
  const [view, setView] = useState<RoomView>("room");
  const [lampOn, setLampOn] = useState(true);
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);
  const [preloadedTrack, setPreloadedTrack] = useState<Track | null>(null);

  const tracks = view === "cassette" ? cassettes : view === "cd" ? cds : vinyls;
  const mediaOpen = view === "cassette" || view === "cd" || view === "vinyl";

  function openMemorySong(track: Track) {
    setPreloadedTrack(track);
    setView(track.format);
  }

  function openView(nextView: RoomView) {
    if (nextView !== "cassette" && nextView !== "cd" && nextView !== "vinyl") {
      setPreloadedTrack(null);
    }
    setView(nextView);
  }

  return (
    <DndContext>
      <main className={`nostalgia-room retro-room-page room-view-${view} ${lampOn ? "room-lit" : "room-dim"}`}>
        <div className="ambient-grain" />

        {view === "room" && (
          <>
            <header className="retro-room-title">
              <p>welcome to</p>
              <h1>The Nostalgia Room</h1>
              <span>click around — almost everything has a story</span>
            </header>

            <RetroRoomScene
              onSelect={openView}
              lampOn={lampOn}
              onToggleLamp={() => setLampOn((value) => !value)}
              onOpenDrawer={setOpenDrawer}
            />
          </>
        )}

        {mediaOpen && (
          <div className="retro-focus-shell">
            <MediaStation
              format={view}
              tracks={tracks}
              initialTrack={preloadedTrack?.format === view ? preloadedTrack : null}
              onBack={() => {
                setPreloadedTrack(null);
                setView("room");
              }}
            />
          </div>
        )}

        {view === "journal" && (
          <section className="retro-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>
            <TypableJournal onOpenBooks={() => setView("books")} onOpenBoard={() => setView("pinboard")} />
          </section>
        )}

        {view === "books" && (
          <section className="retro-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>
            <ReadableBooks onBackToJournal={() => setView("journal")} />
          </section>
        )}

        {openDrawer !== null && view === "room" && (
          <section className="retro-modal-shell drawer-shell">
            <button type="button" className="station-back" onClick={() => setOpenDrawer(null)}>
              ← close drawer
            </button>
            <DeskDrawer drawer={openDrawer} onClose={() => setOpenDrawer(null)} onOpenBoard={() => setView("pinboard")} />
          </section>
        )}

        {view === "computer" && (
          <section className="retro-modal-shell computer-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>
            <RetroComputer
              onBack={() => setView("room")}
              onOpenBoard={() => setView("pinboard")}
              onPlayTrack={openMemorySong}
            />
          </section>
        )}

        {view === "typewriter" && (
          <section className="retro-modal-shell typewriter-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>
            <MiniTypewriter onOpenBoard={() => setView("pinboard")} />
          </section>
        )}

        {view === "pinboard" && (
          <section className="retro-modal-shell pinboard-modal-shell">
            <button type="button" className="station-back" onClick={() => setView("room")}>
              ← back to room
            </button>
            <PinBoard
              onOpenTypewriter={() => setView("typewriter")}
              onPlayMemory={openMemorySong}
            />
          </section>
        )}
      </main>
    </DndContext>
  );
}

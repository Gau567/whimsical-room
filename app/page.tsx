"use client";

import { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";

import RetroRoomScene from "@/components/room/RetroRoomScene";
import RetroComputer from "@/components/room/RetroComputer";
import DeskDrawer from "@/components/room/DeskDrawer";
import TypableJournal from "@/components/room/TypableJournal";
import ReadableBooks from "@/components/room/ReadableBooks";
import MiniTypewriter from "@/components/room/MiniTypewriter";
import PinBoard from "@/components/room/PinBoard";
import MediaStation from "@/components/stations/MediaStation";
import PersistentMusicPlayer from "@/components/PersistentMusicPlayer";
import RoomNowPlaying from "@/components/RoomNowPlaying";

import WorldHub from "@/components/world/WorldHub";
import WorldHUD from "@/components/world/WorldHUD";
import MidnightStudy from "@/components/rooms/study/MidnightStudy";
import ObservatoryRoom from "@/components/rooms/observatory/ObservatoryRoom";

import {
  MusicPlayerProvider,
  useMusicPlayer,
} from "@/lib/MusicPlayerContext";
import { WorldProvider, useWorld } from "@/lib/world/WorldContext";

import { cassettes, cds, vinyls } from "@/data/tracks";
import { MediaFormat, Track } from "@/lib/types";
import { useRoomSoundEffects } from "@/lib/useRoomSoundEffects";

type RoomView =
  | "room"
  | MediaFormat
  | "journal"
  | "books"
  | "computer"
  | "typewriter"
  | "pinboard";

export default function Home() {
  return (
    <MusicPlayerProvider>
      <DndContext>
        <WorldProvider>
          <WorldApp />
        </WorldProvider>
      </DndContext>
    </MusicPlayerProvider>
  );
}

/**
 * WORLD LEVEL
 *
 * This decides which physical room is currently visible.
 * The existing Nostalgia Room remains its own complete mini-app.
 */
function WorldApp() {
  const {
    currentRoom,
    returnToHub,
  } = useWorld();

  return (
    <>
      <WorldHUD />

      {/* HALLWAY */}

      {currentRoom === "hub" && (
        <WorldHub />
      )}


      {/* ROOM 01 — NOSTALGIA */}

      {currentRoom === "nostalgia" && (
        <NostalgiaRoomApp
          onReturnToHub={returnToHub}
        />
      )}


      {/* ROOM 02 — MIDNIGHT STUDY */}

      {currentRoom === "study" && (
        <MidnightStudy />
      )}

      {currentRoom === "observatory" && (
      <ObservatoryRoom />
    )}


      {/* FUTURE ROOMS */}

      {currentRoom !== "hub" &&
        currentRoom !== "nostalgia" &&
        currentRoom !== "study" && 
        currentRoom !== "observatory" && (
          <FutureRoomPlaceholder
            roomName={currentRoom}
            onBack={returnToHub}
          />
        )}
    </>
  );
}

function FutureRoomPlaceholder({
  roomName,
  onBack,
}: {
  roomName: string;
  onBack: () => void;
}) {
  const formattedName =
    roomName === "train"
      ? "Train Compartment"
      : roomName.charAt(0).toUpperCase() + roomName.slice(1);

  return (
    <main className="future-room-placeholder">
      <div className="future-room-card">
        <p>ROOM UNDER CONSTRUCTION</p>

        <h1>{formattedName}</h1>

        <span>something is waiting behind this door.</span>

        <button type="button" onClick={onBack}>
          ← RETURN TO HALLWAY
        </button>
      </div>
    </main>
  );
}

/**
 * ROOM 01 — THE NOSTALGIA ROOM
 *
 * This is your existing page logic, preserved almost exactly as-is.
 * The only world-level addition is the return-to-hallway control.
 */
function NostalgiaRoomApp({ onReturnToHub }: { onReturnToHub: () => void }) {
  const [view, setView] = useState<RoomView>("room");
  const [lampOn, setLampOn] = useState(true);
  const [openDrawer, setOpenDrawer] = useState<number | null>(null);
  const [preloadedTrack, setPreloadedTrack] = useState<Track | null>(null);
  const { loadTrack, currentTrack, isPlaying } = useMusicPlayer();

  useRoomSoundEffects(view === "room");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }

      if (openDrawer !== null) {
        setOpenDrawer(null);
        return;
      }

      if (view !== "room") {
        setPreloadedTrack(null);
        setView("room");
        return;
      }

      // If we are already standing in the room, Escape returns to the hallway.
      onReturnToHub();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [openDrawer, view, onReturnToHub]);

  const tracks =
    view === "cassette" ? cassettes : view === "cd" ? cds : vinyls;

  const mediaOpen =
    view === "cassette" || view === "cd" || view === "vinyl";

  function openMemorySong(track: Track) {
    loadTrack(track);
    setPreloadedTrack(track);
    setView(track.format);
  }

  function openView(nextView: RoomView) {
    if (
      nextView !== "cassette" &&
      nextView !== "cd" &&
      nextView !== "vinyl"
    ) {
      setPreloadedTrack(null);
    }

    setView(nextView);
  }

  function openNowPlaying(track: Track) {
    setPreloadedTrack(track);
    setView(track.format);
  }

  return (
    <>
      <main
        className={`nostalgia-room retro-room-page room-view-${view} ${
          lampOn ? "room-lit" : "room-dim"
        } ${currentTrack ? "has-persistent-music" : ""} ${
          currentTrack ? `room-active-${currentTrack.format}` : ""
        } ${isPlaying ? "room-music-playing" : "room-music-paused"}`}
      >
        <div className="ambient-grain" />

        {view === "room" && (
          <>
            <button
              type="button"
              className="world-return-button"
              onClick={onReturnToHub}
            >
              ← hallway
            </button>

            <header className="retro-room-title">
              <p>welcome to</p>
              <h1>The Nostalgia Room</h1>
              <span>click around — almost everything has a story</span>
              <RoomNowPlaying onOpenTrack={openNowPlaying} />
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
          <div className="retro-focus-shell media-focus-shell">
            <MediaStation
              format={view}
              tracks={tracks}
              initialTrack={
                preloadedTrack?.format === view ? preloadedTrack : null
              }
              onBack={() => {
                setPreloadedTrack(null);
                setView("room");
              }}
            />
          </div>
        )}

        {view === "journal" && (
          <section className="retro-modal-shell">
            <button
              type="button"
              className="station-back"
              onClick={() => setView("room")}
            >
              ← back to room
            </button>
            <TypableJournal
              onOpenBooks={() => setView("books")}
              onOpenBoard={() => setView("pinboard")}
            />
          </section>
        )}

        {view === "books" && (
          <section className="retro-modal-shell">
            <button
              type="button"
              className="station-back"
              onClick={() => setView("room")}
            >
              ← back to room
            </button>
            <ReadableBooks onBackToJournal={() => setView("journal")} />
          </section>
        )}

        {openDrawer !== null && view === "room" && (
          <section className="retro-modal-shell drawer-shell">
            <button
              type="button"
              className="station-back"
              onClick={() => setOpenDrawer(null)}
            >
              ← close drawer
            </button>
            <DeskDrawer
              drawer={openDrawer}
              onClose={() => setOpenDrawer(null)}
              onOpenBoard={() => setView("pinboard")}
              onOpenComputer={() => setView("computer")}
            />
          </section>
        )}

        {view === "computer" && (
          <section className="retro-modal-shell computer-modal-shell">
            <button
              type="button"
              className="station-back"
              onClick={() => setView("room")}
            >
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
            <button
              type="button"
              className="station-back"
              onClick={() => setView("room")}
            >
              ← back to room
            </button>
            <MiniTypewriter onOpenBoard={() => setView("pinboard")} />
          </section>
        )}

        {view === "pinboard" && (
          <section className="retro-modal-shell pinboard-modal-shell">
            <button
              type="button"
              className="station-back"
              onClick={() => setView("room")}
            >
              ← back to room
            </button>
            <PinBoard
              onOpenTypewriter={() => setView("typewriter")}
              onPlayMemory={openMemorySong}
            />
          </section>
        )}
      </main>

      <PersistentMusicPlayer onOpenTrack={openNowPlaying} />
    </>
  );
}

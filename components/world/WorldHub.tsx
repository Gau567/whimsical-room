"use client";

import RoomDoor from "./RoomDoor";
import { useWorld } from "@/lib/world/WorldContext";

export default function WorldHub() {
  const {
    hasItem,
    hasClue,
    isRoomUnlocked,
    completedQuests,
  } = useWorld();

  const hasLens = hasItem("telescope-lens");
  const hasKey = hasItem("small-brass-key") || hasItem("brass-key");
  const hasTrainClue = hasClue("train-platform-seven");
  const solvedStudy = completedQuests.includes("study-locked-drawer");
  const observatoryComplete =
    completedQuests.includes("observatory-complete") || hasItem("star-fragment");

  const observatoryOpen = isRoomUnlocked("observatory");
  const greenhouseOpen = isRoomUnlocked("greenhouse");
  const trainOpen = isRoomUnlocked("train");

  return (
    <main className="world-hall-v2">
      <div className="world-hall-v2-grain" aria-hidden="true" />
      <div className="world-hall-v2-ceiling-glow" aria-hidden="true" />

      <header className="world-hall-v2-header">
        <p>somewhere between</p>
        <h1>The Rooms</h1>
        <span>the hallway remembers what you bring back</span>
      </header>

      <section className="world-hall-v2-scene" aria-label="Hallway between rooms">
        <div className="world-hall-v2-wall world-hall-v2-wall-left">
          <RoomDoor
            room="nostalgia"
            number="01"
            title="The Nostalgia Room"
            subtitle="music leaks softly beneath the door"
            accent="rose"
            className="hall-door-nostalgia"
            detail={<span className="hall-door-sound">♪</span>}
          />

          <RoomDoor
            room="arcade"
            number="03"
            title="Arcade Room"
            subtitle="something in there is still running"
            lockedHint="no power reaches this door yet"
            accent="cyan"
            className="hall-door-arcade"
            detail={<span className="hall-arcade-leds"><i /><i /><i /></span>}
          />

          <RoomDoor
            room="dream"
            number="05"
            title="Dream Room"
            subtitle="you do not remember this door being here"
            lockedHint={observatoryComplete ? "something behind the door noticed the fragment" : "the number keeps changing when you blink"}
            accent="violet"
            className={`hall-door-dream ${observatoryComplete ? "has-observatory-echo" : ""}`}
            detail={observatoryComplete ? <span className="hall-dream-star-echo">✦ the door remembers the sky</span> : <span className="hall-dream-moon">☾</span>}
          />
        </div>

        <div className="world-hall-v2-center">
          <div className="hall-v2-clock">
            <span>11:47</span>
            <small>{hasTrainClue ? "departure?" : "stopped"}</small>
          </div>

          <div className="hall-v2-frame hall-v2-frame-a">
            <span>EVERY ROOM</span>
            <strong>LEAVES SOMETHING BEHIND</strong>
          </div>

          <div className="hall-v2-console">
            <div className="hall-v2-console-top">
              <span className="hall-v2-lamp" />
              <span className="hall-v2-bowl">◌</span>
            </div>

            <div className="hall-v2-note-stack">
              <article className={solvedStudy ? "is-visible" : ""}>
                <small>FOUND IN ROOM 02</small>
                <p>{solvedStudy ? "04 / 17 opened something." : "the paper is blank."}</p>
              </article>

              <article className={hasTrainClue ? "is-visible" : ""}>
                <small>SCRAWLED IN PENCIL</small>
                <p>{hasTrainClue ? "PLATFORM 7 · 11:47" : "? ? ?"}</p>
              </article>

              <article className={observatoryComplete ? "is-visible hall-v2-star-note" : ""}>
                <small>NEW INK · ROOM 04</small>
                <p>{observatoryComplete ? "one fragment remembers the sky ✦" : "the paper is blank."}</p>
              </article>
            </div>
          </div>

          <div className="hall-v2-runner" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </div>

          <p className="hall-v2-floor-whisper">
            {observatoryComplete
              ? "a faint constellation follows you out of Room 04"
              : solvedStudy
                ? "something in the hallway changed while you were away"
                : "some doors open from the other side"}
          </p>
        </div>

        <div className="world-hall-v2-wall world-hall-v2-wall-right">
          <RoomDoor
            room="study"
            number="02"
            title="Midnight Study"
            subtitle="the banker lamp is still burning"
            accent="amber"
            className="hall-door-study"
            detail={solvedStudy ? <span className="hall-study-mark">0417</span> : undefined}
          />

          <RoomDoor
            room="observatory"
            number="04"
            title="Observatory"
            subtitle="cold blue light spills beneath the door"
            lockedHint={hasLens ? "the lens feels warm in your backpack" : "something optical is missing"}
            accent="blue"
            className={`hall-door-observatory ${hasLens ? "has-world-clue" : ""} ${observatoryComplete ? "is-observatory-complete" : ""}`}
            detail={
              observatoryComplete ? (
                <span className="hall-observatory-complete">✦ fragment recovered</span>
              ) : hasLens ? (
                <span className="hall-observatory-lens">
                  <i /> lens recognised
                </span>
              ) : undefined
            }
          />

          <RoomDoor
            room="train"
            number="06"
            title="Train Compartment"
            subtitle="a distant announcement crackles beyond it"
            lockedHint={hasTrainClue ? "a ticket has appeared beneath the door" : "departure unknown"}
            accent="copper"
            className={`hall-door-train ${hasTrainClue ? "has-world-clue" : ""}`}
            detail={
              hasTrainClue ? (
                <span className="hall-train-ticket">11:47 · PLATFORM 7</span>
              ) : undefined
            }
          />
        </div>

        <div className="world-hall-v2-end">
          <RoomDoor
            room="greenhouse"
            number="07"
            title="Greenhouse"
            subtitle="rain taps against glass somewhere beyond"
            lockedHint={hasKey ? "a leaf-tagged key catches the light" : "the lock is unusually small"}
            accent="green"
            className={`hall-door-greenhouse ${hasKey ? "has-world-clue" : ""}`}
            detail={
              hasKey ? (
                <span className="hall-greenhouse-vine">❧ brass key</span>
              ) : undefined
            }
          />
        </div>

        <div className="world-hall-v2-status" aria-live="polite">
          <span className={observatoryOpen ? "is-active" : ""}>◉ observatory</span>
          <span className={trainOpen ? "is-active" : ""}>◉ train</span>
          <span className={greenhouseOpen ? "is-active" : ""}>◉ greenhouse</span>
        </div>
      </section>
    </main>
  );
}

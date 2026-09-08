"use client";

import { useMemo, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

const DRAWER_CODE = "0417";

const BOOKS = [
  {
    id: "sky",
    spine: "NIGHT SKIES",
    title: "A Pocket Atlas of Night Skies",
    accent: "#586f89",
    pages: [
      "Old navigators searched for relationships between stars, not a single bright point.",
      "Margin note: three points make a path. Four numbers make a lock.",
      "The last page has a telescope doodle beside 04 · 17.",
    ],
  },
  {
    id: "margins",
    spine: "MARGINS",
    title: "Notes Written in the Margins",
    accent: "#825d69",
    pages: [
      "Page 12: a clock can be wrong and still be useful.",
      "Page 44: 11:47 is not a time. It is a departure.",
      "Page 71: if the phone rings after midnight, answer only once.",
    ],
  },
  {
    id: "plants",
    spine: "NIGHT BLOOMS",
    title: "Night-Blooming Things",
    accent: "#647861",
    pages: [
      "Moonflower opens after dusk and closes by morning.",
      "A pressed leaf is taped inside: Greenhouse key was never kept in the greenhouse.",
      "Some doors are unlocked by carrying the right thing.",
    ],
  },
  {
    id: "signals",
    spine: "SIGNALS",
    title: "Signals, Static & Small Machines",
    accent: "#95764c",
    pages: [
      "Distant stations can travel strangely after midnight.",
      "Handwritten note: listen for the station that should not exist.",
      "104.7 is underlined twice.",
    ],
  },
];

type ClueId = "date" | "radio" | "clock" | "train";

export default function MidnightStudy() {
  const {
    returnToHub,
    addItem,
    hasItem,
    unlockRoom,
    discoverClue,
    completeQuest,
  } = useWorld();

  const [lampOn, setLampOn] = useState(true);
  const [rainQuiet, setRainQuiet] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCode, setDrawerCode] = useState("");
  const [drawerError, setDrawerError] = useState(false);
  const [bookId, setBookId] = useState<string | null>(null);
  const [bookPage, setBookPage] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [starMapOpen, setStarMapOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [radioOn, setRadioOn] = useState(false);
  const [radioFrequency, setRadioFrequency] = useState(92.3);
  const [clues, setClues] = useState<ClueId[]>(["clock"]);

  const currentBook = useMemo(
    () => BOOKS.find((book) => book.id === bookId) ?? null,
    [bookId],
  );

  const stationFound = radioOn && Math.abs(radioFrequency - 104.7) <= 0.11;
  const hasLens = hasItem("telescope-lens");
  const hasKey = hasItem("small-brass-key");

  function discover(clue: ClueId) {
    setClues((current) => (current.includes(clue) ? current : [...current, clue]));

    if (clue === "clock") discoverClue("study-clock");
    if (clue === "date") discoverClue("study-date");
    if (clue === "radio") discoverClue("study-radio");
    if (clue === "train") discoverClue("train-platform-seven");
  }

  function openNotebook() {
    discover("date");
    setNoteOpen(true);
  }

  function unlockDrawer() {
    if (drawerCode.trim() === DRAWER_CODE) {
      setDrawerOpen(true);
      setDrawerCode("");
      setDrawerError(false);
      completeQuest("study-locked-drawer");
      return;
    }
    setDrawerError(true);
    window.setTimeout(() => setDrawerError(false), 600);
  }

  function collectLens() {
    if (hasLens) return;
    addItem({
      id: "telescope-lens",
      name: "Telescope Lens",
      icon: "◉",
      description: "A brass-edged lens wrapped in old paper. The edge is engraved with a tiny star.",
      sourceRoom: "study",
      useIn: "observatory",
    });
    discoverClue("observatory-lens-found");
    unlockRoom("observatory");
  }

  function collectKey() {
    if (hasKey) return;
    addItem({
      id: "small-brass-key",
      name: "Small Brass Key",
      icon: "⚿",
      description: "A tiny brass key tied to a pressed-leaf tag.",
      sourceRoom: "study",
      useIn: "greenhouse",
    });
    discoverClue("greenhouse-key-found");
    unlockRoom("greenhouse");
  }

  function tuneRadio(value: number) {
    setRadioFrequency(value);
    if (Math.abs(value - 104.7) <= 0.11) discover("radio");
  }

  function answerPhone() {
    discover("train");
    setPhoneOpen(true);
    unlockRoom("train");
  }

  return (
    <main className={`midnight-study-v3 ${lampOn ? "is-lit" : "is-dark"}`}>
      <div className={`study-v3-rain ${rainQuiet ? "is-quiet" : ""}`} aria-hidden="true">
        {Array.from({ length: 22 }, (_, index) => (
          <i key={index} style={{ "--rain": index } as React.CSSProperties} />
        ))}
      </div>

      <header className="study-v3-header">
        <button type="button" onClick={returnToHub}>← hallway</button>
        <div>
          <small>ROOM 02 · AFTER MIDNIGHT</small>
          <h1>Midnight Study</h1>
          <p>somebody left the lamp on and the clock wrong</p>
        </div>
        <button type="button" onClick={() => setRainQuiet((value) => !value)}>
          {rainQuiet ? "rain: quiet" : "rain: window"}
        </button>
      </header>


      <section className="study-v3-room" aria-label="Interactive midnight study">
        <section className="study-v3-wall">
          <button type="button" className="study-v3-window study-v3-hotspot" onClick={() => setStarMapOpen(true)}>
            <span className="study-v3-city"><i/><i/><i/><i/><i/></span>
            <span className="study-v3-window-cross v" />
            <span className="study-v3-window-cross h" />
            <span className="study-v3-tip">rainy window</span>
          </button>

          <button type="button" className="study-v3-star-map study-v3-hotspot" onClick={() => setStarMapOpen(true)}>
            <div className="study-v3-stars">✦ · ✧ · ˚ ✦ · ✧</div>
            <strong>WINTER SKY</strong>
            <small>missing lens noted</small>
            <span className="study-v3-tip">star map</span>
          </button>

          <div className="study-v3-clock" aria-label="Clock stopped at 11:47">
            <span>11:47</span>
            <small>stopped</small>
          </div>

          <button type="button" className="study-v3-board study-v3-hotspot" onClick={() => setBoardOpen(true)}>
            <small>THINGS THAT DON'T FIT</small>
            <div className="study-v3-board-pins">
              <span className="known"><b>CLOCK</b><i>11:47</i></span>
              <span className={clues.includes("date") ? "known" : "unknown"}><b>DATE</b><i>{clues.includes("date") ? "04 / 17" : "? ? ?"}</i></span>
              <span className={clues.includes("radio") ? "known" : "unknown"}><b>RADIO</b><i>{clues.includes("radio") ? "104.7" : "? ? ?"}</i></span>
            </div>
            <em>{clues.length >= 3 ? "these probably belong together" : "connect them later"}</em>
            <span className="study-v3-tip">clue board</span>
          </button>

          <section className="study-v3-bookshelf" aria-label="Study bookshelf">
            <div className="study-v3-shelf-label">REFERENCE · PRIVATE COLLECTION</div>
            <div className="study-v3-books">
              {BOOKS.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  style={{ background: book.accent }}
                  onClick={() => { setBookId(book.id); setBookPage(0); }}
                >
                  <span>{book.spine}</span>
                </button>
              ))}
            </div>
            <div className="study-v3-shelf-decor" aria-hidden="true">
              <span className="study-v3-globe">◌</span>
              <span className="study-v3-plant">♧</span>
              <span className="study-v3-candle">●</span>
            </div>
          </section>
        </section>

        <section className="study-v3-desk">
          <div className="study-v3-desktop">
            <button type="button" className={`study-v3-lamp study-v3-hotspot ${lampOn ? "on" : ""}`} onClick={() => setLampOn((value) => !value)}>
              <span className="study-v3-lamp-shade" />
              <span className="study-v3-lamp-neck" />
              <span className="study-v3-lamp-base" />
              <span className="study-v3-tip">banker lamp</span>
            </button>

            <button type="button" className="study-v3-notebook study-v3-hotspot" onClick={openNotebook}>
              <span><small>APRIL 17</small><i>four numbers</i><i>wrong clock?</i></span>
              <span><b>if the sky map is right,</b><em>start with zero.</em><strong>04 / 17</strong></span>
              <span className="study-v3-tip">open notebook</span>
            </button>

            <button type="button" className="study-v3-phone study-v3-hotspot" onClick={answerPhone}>
              <span className="study-v3-handset" />
              <span className="study-v3-phone-body"><i/><i/><i/><i/><i/><i/></span>
              <span className="study-v3-tip">rotary phone</span>
            </button>

            <div className={`study-v3-radio ${radioOn ? "on" : ""}`}>
              <div className="study-v3-radio-speaker" />
              <div className="study-v3-radio-display">{radioFrequency.toFixed(1)}<small> FM</small></div>
              <input
                aria-label="Radio frequency"
                type="range"
                min="88"
                max="108"
                step="0.1"
                value={radioFrequency}
                onChange={(event) => tuneRadio(Number(event.target.value))}
              />
              <button type="button" onClick={() => setRadioOn((value) => !value)}>{radioOn ? "OFF" : "ON"}</button>
              {stationFound && (
                <div className="study-v3-radio-secret">
                  <small>UNLISTED STATION</small>
                  <strong>...departure 11:47...</strong>
                  <span>...platform seven...</span>
                </div>
              )}
            </div>

            <div className="study-v3-desk-clutter" aria-hidden="true">
              <span className="study-v3-mug">☕</span>
              <span className="study-v3-polaroid" />
              <span className="study-v3-pencilcup">✎</span>
            </div>
          </div>

          <div className="study-v3-desk-front">
            <div className="study-v3-side-drawer"><span /></div>

            <section className={`study-v3-lock-drawer ${drawerOpen ? "open" : ""}`}>
              {!drawerOpen ? (
                <>
                  <small>PRIVATE · 4 DIGITS</small>
                  <div className={`study-v3-code ${drawerError ? "error" : ""}`}>
                    <input
                      value={drawerCode}
                      onChange={(event) => setDrawerCode(event.target.value.replace(/\D/g, ""))}
                      onKeyDown={(event) => { if (event.key === "Enter") unlockDrawer(); }}
                      maxLength={4}
                      inputMode="numeric"
                      placeholder="0000"
                      aria-label="Four-digit drawer code"
                    />
                    <button type="button" onClick={unlockDrawer}>UNLOCK</button>
                  </div>
                  <p>the notebook looks deliberately unhelpful</p>
                </>
              ) : (
                <div className="study-v3-drawer-content">
                  <small>the lock gives a tired little click.</small>
                  <div>
                    <button type="button" onClick={collectLens} disabled={hasLens}>
                      <span>◉</span><strong>telescope lens</strong><em>{hasLens ? "in backpack" : "take"}</em>
                    </button>
                    <button type="button" onClick={collectKey} disabled={hasKey}>
                      <span>⚿</span><strong>small brass key</strong><em>{hasKey ? "in backpack" : "take"}</em>
                    </button>
                  </div>
                  <p>the lens belongs upstairs. the key belongs somewhere wet.</p>
                </div>
              )}
            </section>

            <div className="study-v3-side-drawer"><span /></div>
          </div>
        </section>

        <div className="study-v3-floor" aria-hidden="true">
          <div className="study-v3-rug" />
          <div className="study-v3-floor-books"><i/><i/><i/></div>
          <span className="study-v3-floor-note">PLATFORM 7?</span>
        </div>
      </section>

      <footer className="study-v3-progress">
        <span>{drawerOpen ? "✓ drawer solved" : "○ locked drawer"}</span>
        <span>{clues.includes("radio") ? "✓ strange frequency" : "○ strange frequency"}</span>
        <span>{hasLens ? "✓ telescope lens" : "○ telescope lens"}</span>
        <span>{hasKey ? "✓ brass key" : "○ brass key"}</span>
      </footer>

      {currentBook && (
        <div className="study-v3-modal-backdrop" onMouseDown={() => setBookId(null)}>
          <section className="study-v3-book-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="study-v3-close" onClick={() => setBookId(null)}>×</button>
            <aside style={{ background: currentBook.accent }}><small>ROOM LIBRARY</small><h2>{currentBook.title}</h2></aside>
            <article>
              <small>PAGE {bookPage + 1} / {currentBook.pages.length}</small>
              <p>{currentBook.pages[bookPage]}</p>
              <div>
                <button type="button" disabled={bookPage === 0} onClick={() => setBookPage((value) => value - 1)}>← previous</button>
                <button type="button" disabled={bookPage === currentBook.pages.length - 1} onClick={() => setBookPage((value) => value + 1)}>next →</button>
              </div>
            </article>
          </section>
        </div>
      )}

      {noteOpen && (
        <div className="study-v3-modal-backdrop" onMouseDown={() => setNoteOpen(false)}>
          <section className="study-v3-paper-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="study-v3-close" onClick={() => setNoteOpen(false)}>×</button>
            <small>APRIL 17 · 12:08 AM</small>
            <h2>things to remember before I forget them again</h2>
            <p>Four-digit locks like leading zeroes.</p>
            <p>The clock stopped at 11:47 yesterday.</p>
            <p>The radio manual is lying about something.</p>
            <strong>04 / 17</strong>
          </section>
        </div>
      )}

      {phoneOpen && (
        <div className="study-v3-modal-backdrop" onMouseDown={() => setPhoneOpen(false)}>
          <section className="study-v3-phone-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="study-v3-close" onClick={() => setPhoneOpen(false)}>×</button>
            <small>NO CALLER ID</small>
            <h2>▂▃▅▂▆▃▂▅</h2>
            <p>“If you're still in the study, don't wait for the clock. It stopped before the train did.”</p>
            <p>“Eleven forty-seven. Platform seven.”</p>
            <span>click.</span>
          </section>
        </div>
      )}

      {starMapOpen && (
        <div className="study-v3-modal-backdrop" onMouseDown={() => setStarMapOpen(false)}>
          <section className="study-v3-star-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="study-v3-close" onClick={() => setStarMapOpen(false)}>×</button>
            <small>OBSERVATION SHEET · WINTER SKY</small>
            <div className="study-v3-constellation">✦ ─── ✧ ╲ ✦ ─ ✧</div>
            <h2>something is missing from the telescope.</h2>
            <p>Margin note: lens moved to lower desk drawer after the last storm.</p>
          </section>
        </div>
      )}

      {boardOpen && (
        <div className="study-v3-modal-backdrop" onMouseDown={() => setBoardOpen(false)}>
          <section className="study-v3-board-modal" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="study-v3-close" onClick={() => setBoardOpen(false)}>×</button>
            <small>INVESTIGATION BOARD</small>
            <h2>things that don't fit</h2>
            <div>
              <article><b>CLOCK</b><strong>11:47</strong><p>stopped, but maybe not useless.</p></article>
              <article className={clues.includes("date") ? "known" : "unknown"}><b>DATE</b><strong>{clues.includes("date") ? "04 / 17" : "? ? ?"}</strong><p>{clues.includes("date") ? "found in the notebook." : "something should go here."}</p></article>
              <article className={clues.includes("radio") ? "known" : "unknown"}><b>RADIO</b><strong>{clues.includes("radio") ? "104.7" : "? ? ?"}</strong><p>{clues.includes("radio") ? "an unlisted station." : "frequency still missing."}</p></article>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

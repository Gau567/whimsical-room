"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StudyItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

type MidnightStudyProps = {
  onBack?: () => void;
  onCollectItem?: (item: StudyItem) => void;
  onUnlockRoom?: (roomId: "arcade" | "observatory" | "train" | "greenhouse" | "dream") => void;
};

const BOOKS = [
  {
    id: "astronomy",
    title: "A Pocket Atlas of Night Skies",
    spine: "NIGHT SKIES",
    accent: "#4f6481",
    pages: [
      "Most people look for the brightest star first. Old navigators did something smarter: they looked for relationships between stars.",
      "A pencilled note sits in the margin: 'Three points make a path. Four numbers make a lock.'",
      "The last page has a tiny drawing of a telescope beside: 04 · 17.",
    ],
  },
  {
    id: "margins",
    title: "Notes Written in the Margins",
    spine: "MARGINS",
    accent: "#7c5a61",
    pages: [
      "Page 12: Remember that a clock can be wrong and still be useful.",
      "Page 44: 11:47 is not a time. It is a departure.",
      "Page 71: If the phone rings after midnight, answer only once.",
    ],
  },
  {
    id: "botany",
    title: "Night-Blooming Things",
    spine: "NIGHT BLOOMS",
    accent: "#596d5b",
    pages: [
      "Moonflower opens after dusk and closes by morning. It looks dead all day and dramatic all night.",
      "A pressed leaf is taped between pages. Someone wrote: 'Greenhouse key was never kept in the greenhouse.'",
      "The final paragraph is circled twice: 'Some doors are unlocked by carrying the right thing, not entering the right number.'",
    ],
  },
  {
    id: "signals",
    title: "Signals, Static & Small Machines",
    spine: "SIGNALS",
    accent: "#8c7047",
    pages: [
      "AM radios behave strangely at night. Distant stations can travel farther than they do in daylight.",
      "In the margin: 'Tune until the static breaks. Listen for the station that should not exist.'",
      "A frequency is underlined: 104.7.",
    ],
  },
];

const DRAWER_CODE = "0417";
const STORAGE_KEY = "whimsical-midnight-study-v1";

export default function MidnightStudy({
  onBack,
  onCollectItem,
  onUnlockRoom,
}: MidnightStudyProps) {
  const [lampOn, setLampOn] = useState(true);
  const [radioOn, setRadioOn] = useState(false);
  const [radioFrequency, setRadioFrequency] = useState(92.3);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCode, setDrawerCode] = useState("");
  const [drawerError, setDrawerError] = useState(false);
  const [bookId, setBookId] = useState<string | null>(null);
  const [bookPage, setBookPage] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [starMapOpen, setStarMapOpen] = useState(false);
  const [lensCollected, setLensCollected] = useState(false);
  const [keyCollected, setKeyCollected] = useState(false);
  const [secretFrequencyFound, setSecretFrequencyFound] = useState(false);
  const [rainMuted, setRainMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const radioNoiseRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const currentBook = useMemo(
    () => BOOKS.find((book) => book.id === bookId) ?? null,
    [bookId],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        drawerOpen?: boolean;
        lensCollected?: boolean;
        keyCollected?: boolean;
        secretFrequencyFound?: boolean;
      };
      setDrawerOpen(Boolean(saved.drawerOpen));
      setLensCollected(Boolean(saved.lensCollected));
      setKeyCollected(Boolean(saved.keyCollected));
      setSecretFrequencyFound(Boolean(saved.secretFrequencyFound));
    } catch {
      // Keep default room state when local storage is unavailable or malformed.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ drawerOpen, lensCollected, keyCollected, secretFrequencyFound }),
      );
    } catch {
      // Persistence is optional for the prototype.
    }
  }, [drawerOpen, lensCollected, keyCollected, secretFrequencyFound]);

  useEffect(() => {
    if (!radioOn) {
      stopRadioNoise();
      return;
    }

    startRadioNoise();
    return () => stopRadioNoise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioOn]);

  useEffect(() => {
    if (!radioOn) return;
    if (Math.abs(radioFrequency - 104.7) <= 0.11) {
      setSecretFrequencyFound(true);
    }
  }, [radioFrequency, radioOn]);

  function getAudioContext() {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }

  function softClick(frequency = 190) {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(85, now + 0.055);
    gain.gain.setValueAtTime(0.027, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.06);
  }

  function startRadioNoise() {
    if (radioNoiseRef.current) return;
    const context = getAudioContext();
    if (!context) return;

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    source.buffer = buffer;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.7;
    gain.gain.value = secretFrequencyFound ? 0.006 : 0.012;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();

    radioNoiseRef.current = { source, gain };
  }

  function stopRadioNoise() {
    if (!radioNoiseRef.current) return;
    try {
      radioNoiseRef.current.source.stop();
    } catch {
      // Already stopped.
    }
    radioNoiseRef.current = null;
  }

  function submitDrawerCode() {
    softClick(120);
    if (drawerCode.trim() === DRAWER_CODE) {
      setDrawerOpen(true);
      setDrawerError(false);
      setDrawerCode("");
      return;
    }

    setDrawerError(true);
    window.setTimeout(() => setDrawerError(false), 700);
  }

  function collectLens() {
    if (lensCollected) return;
    setLensCollected(true);
    onCollectItem?.({
      id: "telescope-lens",
      name: "Telescope Lens",
      icon: "◉",
      description: "A brass-edged telescope lens wrapped in old lens paper.",
    });
    onUnlockRoom?.("observatory");
  }

  function collectKey() {
    if (keyCollected) return;
    setKeyCollected(true);
    onCollectItem?.({
      id: "greenhouse-key",
      name: "Small Brass Key",
      icon: "⚿",
      description: "A small brass key with a pressed-leaf tag tied to it.",
    });
  }

  function openBook(id: string) {
    softClick(235);
    setBookId(id);
    setBookPage(0);
  }

  return (
    <main
      className={`midnight-study ${lampOn ? "study-lamp-on" : "study-lamp-off"} ${rainMuted ? "study-rain-muted" : ""}`}
    >
      <div className="study-rain" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i key={index} style={{ "--rain-index": index } as React.CSSProperties} />
        ))}
      </div>

      <header className="study-topbar">
        <button type="button" className="study-back" onClick={onBack}>
          ← hallway
        </button>
        <div>
          <small>ROOM 02 · 12:43 AM</small>
          <h1>Midnight Study</h1>
          <p>the lamp was already on when you arrived</p>
        </div>
        <button
          type="button"
          className="study-rain-button"
          onClick={() => setRainMuted((value) => !value)}
          aria-pressed={rainMuted}
        >
          {rainMuted ? "rain: quiet" : "rain: window"}
        </button>
      </header>

      <section className="study-room" aria-label="Interactive midnight study">
        <div className="study-wall">
          <button
            type="button"
            className="study-window study-hotspot"
            onClick={() => setStarMapOpen(true)}
            aria-label="Inspect the rainy window and star chart"
          >
            <span className="study-window-sky"><i /><i /><i /><i /></span>
            <span className="study-window-frame study-window-frame-a" />
            <span className="study-window-frame study-window-frame-b" />
            <span className="study-window-glow" />
            <span className="study-object-tip">rain + constellations</span>
          </button>

          <button
            type="button"
            className="study-star-map study-hotspot"
            onClick={() => setStarMapOpen(true)}
            aria-label="Inspect star map"
          >
            <span className="study-map-stars">✦ · ˚ ✧ · ✦ ˚ · ✧</span>
            <strong>WINTER SKY</strong>
            <small>04 / 17</small>
            <span className="study-object-tip">star map</span>
          </button>

          <div className="study-wall-clock" aria-label="Wall clock stopped at 11:47">
            <span>11:47</span>
            <small>stopped</small>
          </div>

          <div className="study-bookshelf">
            <div className="study-shelf-top"><span>REFERENCE</span></div>
            <div className="study-book-row">
              {BOOKS.map((book, index) => (
                <button
                  key={book.id}
                  type="button"
                  className={`study-book study-book-${index + 1}`}
                  style={{ backgroundColor: book.accent }}
                  onClick={() => openBook(book.id)}
                  aria-label={`Read ${book.title}`}
                >
                  <span>{book.spine}</span>
                </button>
              ))}
            </div>
            <div className="study-shelf-objects" aria-hidden="true">
              <span className="study-globe">◌</span>
              <span className="study-plant">♧</span>
              <span className="study-candle">●</span>
            </div>
          </div>
        </div>

        <div className="study-desk-zone">
          <div className="study-desk-surface">
            <button
              type="button"
              className={`banker-lamp study-hotspot ${lampOn ? "is-on" : ""}`}
              onClick={() => {
                softClick(320);
                setLampOn((value) => !value);
              }}
              aria-pressed={lampOn}
              aria-label={`Turn desk lamp ${lampOn ? "off" : "on"}`}
            >
              <span className="lamp-shade" />
              <span className="lamp-neck" />
              <span className="lamp-base" />
              <span className="study-object-tip">desk lamp</span>
            </button>

            <button
              type="button"
              className="study-notebook study-hotspot"
              onClick={() => setNoteOpen(true)}
              aria-label="Read the open notebook"
            >
              <span className="notebook-page notebook-left">
                <small>APRIL 17</small>
                <i>four numbers</i>
                <i>one drawer</i>
                <i>wrong clock?</i>
              </span>
              <span className="notebook-page notebook-right">
                <b>if the sky map is right,</b>
                <em>start with zero.</em>
                <span>✦ 04 / 17</span>
              </span>
              <span className="study-object-tip">open notebook</span>
            </button>

            <button
              type="button"
              className="study-phone study-hotspot"
              onClick={() => {
                softClick(145);
                setPhoneOpen(true);
              }}
              aria-label="Answer the rotary phone"
            >
              <span className="phone-handset" />
              <span className="phone-body"><i /><i /><i /><i /><i /><i /></span>
              <span className="study-object-tip">rotary phone</span>
            </button>

            <div className={`study-radio ${radioOn ? "radio-on" : ""}`}>
              <div className="radio-speaker" aria-hidden="true" />
              <div className="radio-display">
                <span>{radioFrequency.toFixed(1)}</span>
                <small>FM</small>
              </div>
              <input
                aria-label="Radio frequency"
                type="range"
                min="88"
                max="108"
                step="0.1"
                value={radioFrequency}
                onChange={(event) => setRadioFrequency(Number(event.target.value))}
              />
              <button
                type="button"
                onClick={() => {
                  softClick(205);
                  setRadioOn((value) => !value);
                }}
              >
                {radioOn ? "OFF" : "ON"}
              </button>
              {secretFrequencyFound && radioOn && (
                <div className="radio-secret-message">
                  <small>UNLISTED STATION</small>
                  <strong>...train leaves at 11:47...</strong>
                  <span>...platform seven...</span>
                </div>
              )}
            </div>

            <div className="study-pencil-cup" aria-hidden="true"><i /><i /><i /></div>
            <div className="study-mug" aria-hidden="true">☕</div>
          </div>

          <div className="study-desk-front">
            <div className="study-drawer-panel study-drawer-left" aria-hidden="true"><span /></div>

            <section className={`study-lock-drawer ${drawerOpen ? "is-open" : ""}`}>
              {!drawerOpen ? (
                <>
                  <div className="study-drawer-label">
                    <span>PRIVATE</span>
                    <small>4 DIGITS</small>
                  </div>
                  <div className={`study-code-entry ${drawerError ? "is-error" : ""}`}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={drawerCode}
                      onChange={(event) => setDrawerCode(event.target.value.replace(/\D/g, ""))}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitDrawerCode();
                      }}
                      placeholder="0000"
                      aria-label="Four digit drawer code"
                    />
                    <button type="button" onClick={submitDrawerCode}>UNLOCK</button>
                  </div>
                  <small className="study-code-hint">the notebook looks deliberately unhelpful</small>
                </>
              ) : (
                <div className="study-drawer-open-content">
                  <p>the lock gives a tired little click.</p>
                  <div className="study-drawer-treasure-row">
                    <button
                      type="button"
                      className={`study-treasure ${lensCollected ? "is-collected" : ""}`}
                      onClick={collectLens}
                      disabled={lensCollected}
                    >
                      <span>◉</span>
                      <strong>telescope lens</strong>
                      <small>{lensCollected ? "collected" : "take it"}</small>
                    </button>
                    <button
                      type="button"
                      className={`study-treasure ${keyCollected ? "is-collected" : ""}`}
                      onClick={collectKey}
                      disabled={keyCollected}
                    >
                      <span>⚿</span>
                      <strong>small brass key</strong>
                      <small>{keyCollected ? "collected" : "take it"}</small>
                    </button>
                  </div>
                  <div className="study-drawer-letter">
                    <small>NOTE</small>
                    <p>The lens belongs upstairs. The key belongs somewhere wet.</p>
                  </div>
                </div>
              )}
            </section>

            <div className="study-drawer-panel study-drawer-right" aria-hidden="true"><span /></div>
          </div>
        </div>

        <div className="study-floor" aria-hidden="true">
          <div className="study-rug" />
          <div className="study-floor-books"><i /><i /><i /></div>
        </div>
      </section>

      <aside className="study-clue-strip" aria-label="Study discoveries">
        <span>{drawerOpen ? "✓ drawer opened" : "○ locked drawer"}</span>
        <span>{secretFrequencyFound ? "✓ strange station" : "○ strange frequency"}</span>
        <span>{lensCollected ? "✓ telescope lens" : "○ missing lens"}</span>
        <span>{keyCollected ? "✓ brass key" : "○ unlabeled key"}</span>
      </aside>

      {currentBook && (
        <div className="study-modal-backdrop" onMouseDown={() => setBookId(null)}>
          <section className="study-book-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="study-modal-close" onClick={() => setBookId(null)}>×</button>
            <div className="study-book-cover" style={{ backgroundColor: currentBook.accent }}>
              <small>ROOM LIBRARY</small>
              <h2>{currentBook.title}</h2>
              <span>{currentBook.spine}</span>
            </div>
            <article className="study-book-page">
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
        <div className="study-modal-backdrop" onMouseDown={() => setNoteOpen(false)}>
          <section className="study-paper-note" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="study-modal-close" onClick={() => setNoteOpen(false)}>×</button>
            <small>APRIL 17 · 12:08 AM</small>
            <h2>things to remember before I forget them again</h2>
            <p>1. The wall clock stopped at 11:47 yesterday.</p>
            <p>2. Atlas says the useful date is written month first.</p>
            <p>3. Four-digit locks like leading zeroes. Annoying, but important.</p>
            <p>4. Radio manual is probably lying about the frequency range.</p>
            <span>04 / 17</span>
          </section>
        </div>
      )}

      {phoneOpen && (
        <div className="study-modal-backdrop" onMouseDown={() => setPhoneOpen(false)}>
          <section className="study-phone-message" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="study-modal-close" onClick={() => setPhoneOpen(false)}>×</button>
            <div className="phone-message-wave">▂▃▅▂▆▃▂▅</div>
            <small>LINE CONNECTED · NO CALLER ID</small>
            <p>“If you're still in the study, don't wait for the clock. It stopped before the train did.”</p>
            <p>“Eleven forty-seven. Platform seven.”</p>
            <span>click.</span>
          </section>
        </div>
      )}

      {starMapOpen && (
        <div className="study-modal-backdrop" onMouseDown={() => setStarMapOpen(false)}>
          <section className="study-star-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="study-modal-close" onClick={() => setStarMapOpen(false)}>×</button>
            <small>OBSERVATION SHEET · WINTER SKY</small>
            <div className="study-big-constellation" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
              <span className="constellation-line c-line-1" />
              <span className="constellation-line c-line-2" />
              <span className="constellation-line c-line-3" />
              <span className="constellation-line c-line-4" />
            </div>
            <h2>something is missing from the telescope.</h2>
            <p>Margin note: “Lens moved to lower desk drawer after the last storm.”</p>
            <strong>04 · 17</strong>
          </section>
        </div>
      )}
    </main>
  );
}

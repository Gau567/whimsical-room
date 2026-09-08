"use client";

import { useEffect, useMemo, useState } from "react";

type StudyInventoryItem = {
  id: "telescope-lens" | "small-brass-key";
  name: string;
  icon: string;
  description: string;
  useIn: string;
};

type MidnightStudyProps = {
  onBack?: () => void;
  onUnlockRoom?: (room: "observatory" | "greenhouse" | "train") => void;
  onCollectItem?: (item: StudyInventoryItem) => void;
};

const INVENTORY_KEY = "whimsical-study-backpack-v2";
const DRAWER_CODE = "0417";

const BOOKS = [
  {
    id: "sky",
    spine: "NIGHT SKIES",
    title: "A Pocket Atlas of Night Skies",
    accent: "#566d86",
    pages: [
      "Old navigators did not search for a single bright star. They searched for relationships between stars.",
      "A note in the margin reads: three points make a path. Four numbers make a lock.",
      "The last page has a telescope doodle beside: 04 · 17.",
    ],
  },
  {
    id: "margins",
    spine: "MARGINS",
    title: "Notes Written in the Margins",
    accent: "#7f5c67",
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
    accent: "#60745f",
    pages: [
      "Moonflower opens after dusk and closes by morning.",
      "A pressed leaf is taped inside. Someone wrote: Greenhouse key was never kept in the greenhouse.",
      "The final line is circled: some doors are unlocked by carrying the right thing.",
    ],
  },
  {
    id: "signals",
    spine: "SIGNALS",
    title: "Signals, Static & Small Machines",
    accent: "#92744a",
    pages: [
      "AM and FM behave strangely after midnight. Distant stations can feel much closer.",
      "A handwritten note says: listen for the station that should not exist.",
      "104.7 is underlined twice.",
    ],
  },
];

const CLUE_CARDS = [
  { title: "CLOCK", body: "stopped at 11:47", mark: "11:47" },
  { title: "DATE", body: "atlas keeps repeating it", mark: "04 / 17" },
  { title: "RADIO", body: "manual lies about one station", mark: "104.7" },
];

export default function MidnightStudy({ onBack, onUnlockRoom, onCollectItem }: MidnightStudyProps) {
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
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [radioOn, setRadioOn] = useState(false);
  const [radioFrequency, setRadioFrequency] = useState(92.3);
  const [inventory, setInventory] = useState<StudyInventoryItem[]>([]);

  // IMPORTANT: drawerOpen + drawerCode intentionally do NOT persist.
  // Reloading the page re-locks the puzzle and clears the password field.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INVENTORY_KEY);
      if (raw) setInventory(JSON.parse(raw));
    } catch {
      // Local persistence is optional.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    } catch {
      // Local persistence is optional.
    }
  }, [inventory]);

  const currentBook = useMemo(() => BOOKS.find((book) => book.id === bookId) ?? null, [bookId]);
  const hasLens = inventory.some((item) => item.id === "telescope-lens");
  const hasKey = inventory.some((item) => item.id === "small-brass-key");
  const stationFound = radioOn && Math.abs(radioFrequency - 104.7) <= 0.11;

  function unlockDrawer() {
    if (drawerCode === DRAWER_CODE) {
      setDrawerOpen(true);
      setDrawerCode("");
      setDrawerError(false);
      return;
    }
    setDrawerError(true);
    window.setTimeout(() => setDrawerError(false), 550);
  }

  function collect(item: StudyInventoryItem) {
    setInventory((current) => {
      if (current.some((existing) => existing.id === item.id)) return current;
      return [...current, item];
    });
    onCollectItem?.(item);

    if (item.id === "telescope-lens") onUnlockRoom?.("observatory");
    if (item.id === "small-brass-key") onUnlockRoom?.("greenhouse");
  }

  return (
    <main className={`midnight-study midnight-study-v2 ${lampOn ? "study-lamp-on" : "study-lamp-off"} ${rainQuiet ? "study-rain-muted" : ""}`}>
      <div className="study-rain" aria-hidden="true">
        {Array.from({ length: 32 }, (_, i) => <i key={i} style={{ "--rain-index": i } as React.CSSProperties} />)}
      </div>

      <header className="study-topbar">
        <button type="button" className="study-back" onClick={onBack}>← hallway</button>
        <div>
          <small>ROOM 02 · 12:43 AM</small>
          <h1>Midnight Study</h1>
          <p>the lamp was already on when you arrived</p>
        </div>
        <button type="button" className="study-rain-button" onClick={() => setRainQuiet((v) => !v)}>
          {rainQuiet ? "rain: quiet" : "rain: window"}
        </button>
      </header>

      <button type="button" className="study-backpack-button" onClick={() => setBackpackOpen(true)} aria-label="Open backpack">
        <span>🎒</span>
        <strong>BACKPACK</strong>
        <small>{inventory.length}/2</small>
      </button>

      <section className="study-room">
        <div className="study-wall-glow" aria-hidden="true" />
        <div className="study-dust" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>

        <div className="study-wall">
          <button type="button" className="study-window study-hotspot" onClick={() => setStarMapOpen(true)}>
            <span className="study-window-sky"><i/><i/><i/><i/></span>
            <span className="study-window-frame study-window-frame-a" />
            <span className="study-window-frame study-window-frame-b" />
            <span className="study-window-glow" />
            <span className="study-object-tip">rain + constellations</span>
          </button>

          <button type="button" className="study-star-map study-hotspot" onClick={() => setStarMapOpen(true)}>
            <span className="study-map-stars">✦ · ˚ ✧ · ✦ ˚ · ✧</span>
            <strong>WINTER SKY</strong>
            <small>04 / 17</small>
            <span className="study-object-tip">star map</span>
          </button>

          <button type="button" className="study-clue-board study-hotspot" onClick={() => setBoardOpen(true)}>
            <strong>THINGS THAT DON'T FIT</strong>
            <div className="study-clue-board-grid">
              {CLUE_CARDS.map((clue) => <span key={clue.title}><b>{clue.title}</b><i>{clue.mark}</i></span>)}
            </div>
            <em>connect them later</em>
            <span className="study-object-tip">clue board</span>
          </button>

          <div className="study-wall-clock"><span>11:47</span><small>stopped</small></div>

          <div className="study-bookshelf">
            <div className="study-shelf-top"><span>REFERENCE · PRIVATE COLLECTION</span></div>
            <div className="study-book-row">
              {BOOKS.map((book, index) => (
                <button key={book.id} type="button" className={`study-book study-book-${index + 1}`} style={{ backgroundColor: book.accent }} onClick={() => { setBookId(book.id); setBookPage(0); }}>
                  <span>{book.spine}</span>
                </button>
              ))}
            </div>
            <div className="study-shelf-objects">
              <span className="study-globe">◌</span>
              <span className="study-plant">♧</span>
              <span className="study-candle">●</span>
            </div>
          </div>
        </div>

        <div className="study-desk-zone">
          <div className="study-desk-surface">
            <button type="button" className={`banker-lamp study-hotspot ${lampOn ? "is-on" : ""}`} onClick={() => setLampOn((v) => !v)}>
              <span className="lamp-shade"/><span className="lamp-neck"/><span className="lamp-base"/>
              <span className="study-object-tip">desk lamp</span>
            </button>

            <button type="button" className="study-notebook study-hotspot" onClick={() => setNoteOpen(true)}>
              <span className="notebook-page notebook-left"><small>APRIL 17</small><i>four numbers</i><i>one drawer</i><i>wrong clock?</i></span>
              <span className="notebook-page notebook-right"><b>if the sky map is right,</b><em>start with zero.</em><span>✦ 04 / 17</span></span>
              <span className="study-object-tip">open notebook</span>
            </button>

            {/* Phone moved safely inside the desk surface; no viewport clipping. */}
            <button type="button" className="study-phone study-phone-v2 study-hotspot" onClick={() => setPhoneOpen(true)}>
              <span className="phone-handset"/>
              <span className="phone-body"><i/><i/><i/><i/><i/><i/></span>
              <span className="study-object-tip">rotary phone</span>
            </button>

            <div className={`study-radio study-radio-v2 ${radioOn ? "radio-on" : ""}`}>
              <div className="radio-speaker"/>
              <div className="radio-display"><span>{radioFrequency.toFixed(1)}</span><small> FM</small></div>
              <input type="range" min="88" max="108" step="0.1" value={radioFrequency} onChange={(e) => setRadioFrequency(Number(e.target.value))} aria-label="Radio frequency" />
              <button type="button" onClick={() => setRadioOn((v) => !v)}>{radioOn ? "OFF" : "ON"}</button>
              {stationFound && <div className="radio-secret-message"><small>UNLISTED STATION</small><strong>...train leaves at 11:47...</strong><span>...platform seven...</span></div>}
            </div>

            <div className="study-pencil-cup"><i/><i/><i/></div>
            <div className="study-mug">☕</div>
            <div className="study-desk-photo" aria-hidden="true"><span /></div>
            <div className="study-matchbox" aria-hidden="true">MATCHES</div>
          </div>

          <div className="study-desk-front">
            <div className="study-drawer-panel study-drawer-left"><span/></div>
            <section className={`study-lock-drawer ${drawerOpen ? "is-open" : ""}`}>
              {!drawerOpen ? (
                <>
                  <div className="study-drawer-label"><span>PRIVATE</span><small>4 DIGITS</small></div>
                  <div className={`study-code-entry ${drawerError ? "is-error" : ""}`}>
                    <input type="text" inputMode="numeric" maxLength={4} value={drawerCode} onChange={(e) => setDrawerCode(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && unlockDrawer()} placeholder="0000" />
                    <button type="button" onClick={unlockDrawer}>UNLOCK</button>
                  </div>
                  <small className="study-code-hint">reload = this drawer locks again</small>
                </>
              ) : (
                <div className="study-drawer-open-content">
                  <p>the lock gives a tired little click.</p>
                  <div className="study-drawer-treasure-row">
                    <button type="button" className={`study-treasure ${hasLens ? "is-collected" : ""}`} disabled={hasLens} onClick={() => collect({ id: "telescope-lens", name: "Telescope Lens", icon: "◉", description: "A brass-edged telescope lens wrapped in old lens paper.", useIn: "Observatory · fit it into the empty telescope mount" })}>
                      <span>◉</span><strong>telescope lens</strong><small>{hasLens ? "in backpack" : "put in backpack"}</small>
                    </button>
                    <button type="button" className={`study-treasure ${hasKey ? "is-collected" : ""}`} disabled={hasKey} onClick={() => collect({ id: "small-brass-key", name: "Small Brass Key", icon: "⚿", description: "A tiny brass key with a pressed-leaf tag tied around its bow.", useIn: "Greenhouse · there should be a locked botanical cabinet" })}>
                      <span>⚿</span><strong>small brass key</strong><small>{hasKey ? "in backpack" : "put in backpack"}</small>
                    </button>
                  </div>
                  <div className="study-drawer-letter"><small>NOTE</small><p>The lens belongs upstairs. The key belongs somewhere wet.</p></div>
                </div>
              )}
            </section>
            <div className="study-drawer-panel study-drawer-right"><span/></div>
          </div>
        </div>

        <div className="study-floor"><div className="study-rug"/><div className="study-floor-books"><i/><i/><i/></div><div className="study-floor-paper">PLATFORM 7?</div></div>
      </section>

      <aside className="study-clue-strip">
        <span>{drawerOpen ? "✓ drawer opened this visit" : "○ locked drawer"}</span>
        <span>{stationFound ? "✓ strange station" : "○ strange frequency"}</span>
        <span>{hasLens ? "✓ lens in backpack" : "○ telescope lens"}</span>
        <span>{hasKey ? "✓ key in backpack" : "○ brass key"}</span>
      </aside>

      {backpackOpen && (
        <div className="study-modal-backdrop" onMouseDown={() => setBackpackOpen(false)}>
          <section className="study-backpack-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="study-modal-close" onClick={() => setBackpackOpen(false)}>×</button>
            <small>WORLD INVENTORY · TEMPORARY PROTOTYPE</small>
            <h2>Your Backpack</h2>
            <p className="study-backpack-intro">Quest objects stay here when you reload. The drawer itself does not.</p>
            <div className="study-backpack-grid">
              {inventory.length === 0 && <div className="study-backpack-empty">nothing yet.<br/>the desk drawer looks suspicious.</div>}
              {inventory.map((item) => (
                <article key={item.id}>
                  <span>{item.icon}</span>
                  <div><strong>{item.name}</strong><p>{item.description}</p><small>USE: {item.useIn}</small></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {currentBook && (
        <div className="study-modal-backdrop" onMouseDown={() => setBookId(null)}>
          <section className="study-book-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="study-modal-close" onClick={() => setBookId(null)}>×</button>
            <div className="study-book-cover" style={{ backgroundColor: currentBook.accent }}><small>ROOM LIBRARY</small><h2>{currentBook.title}</h2><span>{currentBook.spine}</span></div>
            <article className="study-book-page"><small>PAGE {bookPage + 1} / {currentBook.pages.length}</small><p>{currentBook.pages[bookPage]}</p><div><button disabled={bookPage === 0} onClick={() => setBookPage((v) => v - 1)}>← previous</button><button disabled={bookPage === currentBook.pages.length - 1} onClick={() => setBookPage((v) => v + 1)}>next →</button></div></article>
          </section>
        </div>
      )}

      {noteOpen && <SimpleModal onClose={() => setNoteOpen(false)} className="study-paper-note"><small>APRIL 17 · 12:08 AM</small><h2>things to remember before I forget them again</h2><p>1. The wall clock stopped at 11:47 yesterday.</p><p>2. Atlas says the useful date is written month first.</p><p>3. Four-digit locks like leading zeroes.</p><p>4. The radio manual is lying.</p><span>04 / 17</span></SimpleModal>}

      {phoneOpen && <SimpleModal onClose={() => setPhoneOpen(false)} className="study-phone-message"><div className="phone-message-wave">▂▃▅▂▆▃▂▅</div><small>LINE CONNECTED · NO CALLER ID</small><p>“If you're still in the study, don't wait for the clock. It stopped before the train did.”</p><p>“Eleven forty-seven. Platform seven.”</p><span>click.</span></SimpleModal>}

      {starMapOpen && <SimpleModal onClose={() => setStarMapOpen(false)} className="study-star-modal"><small>OBSERVATION SHEET · WINTER SKY</small><div className="study-big-constellation"><i/><i/><i/><i/><i/><i/></div><h2>something is missing from the telescope.</h2><p>Margin note: “Lens moved to lower desk drawer after the last storm.”</p><strong>04 · 17</strong></SimpleModal>}

      {boardOpen && <SimpleModal onClose={() => setBoardOpen(false)} className="study-board-modal"><small>PINNED CONNECTIONS</small><h2>Three facts that probably aren't separate.</h2>{CLUE_CARDS.map((clue) => <div className="study-board-line" key={clue.title}><span>{clue.mark}</span><p><b>{clue.title}</b> — {clue.body}</p></div>)}<em>Someone has drawn a line from 11:47 to the word TRAIN.</em></SimpleModal>}
    </main>
  );
}

function SimpleModal({ children, onClose, className }: { children: React.ReactNode; onClose: () => void; className: string }) {
  return (
    <div className="study-modal-backdrop" onMouseDown={onClose}>
      <section className={className} onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="study-modal-close" onClick={onClose}>×</button>
        {children}
      </section>
    </div>
  );
}

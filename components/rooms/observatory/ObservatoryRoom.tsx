"use client";

import { useMemo, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type SkyTarget = "moon" | "sun" | "galaxy" | "stars";

type CountryFact = {
  country: string;
  emoji: string;
  capital: string;
  fact: string;
};

const COUNTRY_FACTS: CountryFact[] = [
  {
    country: "Japan",
    emoji: "🗾",
    capital: "Tokyo",
    fact: "Japan has more than 6,800 islands, and its rail network is famous for extremely precise timetables.",
  },
  {
    country: "Singapore",
    emoji: "🇸🇬",
    capital: "Singapore",
    fact: "Singapore is one of the few city-states in the world, and more than half of the island is covered by greenery.",
  },
  {
    country: "Iceland",
    emoji: "🇮🇸",
    capital: "Reykjavík",
    fact: "Iceland sits across two tectonic plates, which helps explain its volcanoes, geysers and geothermal energy.",
  },
  {
    country: "Brazil",
    emoji: "🇧🇷",
    capital: "Brasília",
    fact: "Brazil contains most of the Amazon rainforest and is home to more known plant species than any other country.",
  },
  {
    country: "New Zealand",
    emoji: "🇳🇿",
    capital: "Wellington",
    fact: "New Zealand was one of the last large landmasses settled by humans and has many bird species found nowhere else.",
  },
  {
    country: "Morocco",
    emoji: "🇲🇦",
    capital: "Rabat",
    fact: "Morocco is home to the Atlas Mountains and the old city of Fez, whose medieval medina is one of the world's largest.",
  },
  {
    country: "Norway",
    emoji: "🇳🇴",
    capital: "Oslo",
    fact: "Norway's coastline is deeply carved by fjords formed by glaciers over thousands of years.",
  },
  {
    country: "India",
    emoji: "🇮🇳",
    capital: "New Delhi",
    fact: "India has one of the world's largest railway systems and is home to more than 1,600 spoken languages and dialects.",
  },
  {
    country: "Chile",
    emoji: "🇨🇱",
    capital: "Santiago",
    fact: "Chile's Atacama Desert is one of the driest places on Earth and hosts some of the world's most powerful observatories.",
  },
  {
    country: "Egypt",
    emoji: "🇪🇬",
    capital: "Cairo",
    fact: "The Nile has shaped Egyptian life for thousands of years, and the Great Pyramid of Giza is the oldest surviving ancient wonder.",
  },
  {
    country: "Canada",
    emoji: "🇨🇦",
    capital: "Ottawa",
    fact: "Canada has more lakes than any other country and the world's longest coastline.",
  },
  {
    country: "South Korea",
    emoji: "🇰🇷",
    capital: "Seoul",
    fact: "South Korea has one of the fastest average internet infrastructures in the world and a mountainous landscape covering much of the country.",
  },
];

const STAR_NOTES = [
  {
    title: "Polaris",
    text: "The North Star appears nearly fixed in the northern sky because it sits close to Earth's rotational axis.",
  },
  {
    title: "Betelgeuse",
    text: "A red supergiant in Orion. If it replaced our Sun, its outer layers would extend far beyond Earth's orbit.",
  },
  {
    title: "Pleiades",
    text: "A bright open star cluster often called the Seven Sisters. Under dark skies, several stars are visible without a telescope.",
  },
  {
    title: "Andromeda",
    text: "The nearest large galaxy to the Milky Way. Under very dark skies it can be spotted as a faint smudge with the naked eye.",
  },
];

const JOURNAL_PAGES = [
  {
    heading: "Observation 17",
    body: "The missing brass lens was moved downstairs after the storm. Without it, the telescope shows only a soft circle of light. I wrapped it in lens paper and left it where I thought nobody would look.",
  },
  {
    heading: "Observation 18",
    body: "The constellation wheel is temperamental. The order matters: North Star, three-point crown, then the little falling star. The mechanism makes a lovely click when the pattern is correct.",
  },
  {
    heading: "Observation 19",
    body: "There is a coordinate I cannot explain: 05h 35m · −05° 23′. It appears whenever the brass gears align. I copied it onto a small card and hid it in the celestial drawer.",
  },
];

const CONSTELLATION_ORDER = ["north", "crown", "falling"] as const;
type ConstellationNode = (typeof CONSTELLATION_ORDER)[number];

export default function ObservatoryRoom() {
  const {
    returnToHub,
    hasItem,
    addItem,
    removeItem,
    completeQuest,
    discoverClue,
    isQuestComplete,
  } = useWorld();

  const [lampOn, setLampOn] = useState(true);
  const [domeOpen, setDomeOpen] = useState(true);
  const [lensInstalled, setLensInstalled] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [skyTarget, setSkyTarget] = useState<SkyTarget>("moon");
  const [zoom, setZoom] = useState(1);
  const [countryFact, setCountryFact] = useState<CountryFact | null>(null);
  const [globeSpinning, setGlobeSpinning] = useState(false);
  const [journalPage, setJournalPage] = useState<number | null>(null);
  const [starNote, setStarNote] = useState<number | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<ConstellationNode[]>([]);
  const [constellationSolved, setConstellationSolved] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orreryRunning, setOrreryRunning] = useState(true);
  const [moonPhase, setMoonPhase] = useState(3);
  const [toast, setToast] = useState<string | null>(null);

  const ownsLens = hasItem("telescope-lens");
  const hasCoordinateCard = hasItem("celestial-coordinate-card");
  const lensQuestComplete = isQuestComplete("observatory-missing-lens");

  const activeSkyCopy = useMemo(() => {
    const copy: Record<SkyTarget, { title: string; subtitle: string }> = {
      moon: {
        title: "The Moon",
        subtitle: "craters, maria and a very quiet horizon",
      },
      sun: {
        title: "The Sun",
        subtitle: "filtered view · never observe directly without protection",
      },
      galaxy: {
        title: "Andromeda Galaxy",
        subtitle: "a soft spiral drifting beyond the Milky Way",
      },
      stars: {
        title: "Winter Stars",
        subtitle: "Orion, Taurus and a suspiciously bright trail",
      },
    };
    return copy[skyTarget];
  }, [skyTarget]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function installLens() {
    if (lensInstalled || lensQuestComplete) {
      setLensInstalled(true);
      showToast("The brass lens is already seated in the telescope.");
      return;
    }

    if (!ownsLens) {
      showToast("The telescope mount is empty. The missing lens must be somewhere else.");
      return;
    }

    setLensInstalled(true);
    removeItem("telescope-lens");
    completeQuest("observatory-missing-lens");
    discoverClue("observatory-lens-installed");
    showToast("The lens clicks into place. The sky snaps into focus.");
  }

  function spinGlobe() {
    if (globeSpinning) return;
    setGlobeSpinning(true);
    setCountryFact(null);

    window.setTimeout(() => {
      const next = COUNTRY_FACTS[Math.floor(Math.random() * COUNTRY_FACTS.length)];
      setCountryFact(next);
      setGlobeSpinning(false);
    }, 900);
  }

  function chooseConstellationNode(node: ConstellationNode) {
    if (constellationSolved) return;

    const nextIndex = selectedNodes.length;
    const expected = CONSTELLATION_ORDER[nextIndex];

    if (node !== expected) {
      setSelectedNodes([]);
      showToast("The brass star wheel slips back to its starting position.");
      return;
    }

    const next = [...selectedNodes, node];
    setSelectedNodes(next);

    if (next.length === CONSTELLATION_ORDER.length) {
      setConstellationSolved(true);
      setDrawerOpen(true);
      discoverClue("observatory-constellation-solved");
      completeQuest("observatory-star-wheel");
      showToast("Three brass clicks. A hidden drawer slides open.");
    }
  }

  function collectCoordinateCard() {
    if (hasCoordinateCard) {
      showToast("The coordinate card is already in your backpack.");
      return;
    }

    addItem({
      id: "celestial-coordinate-card",
      name: "Celestial Coordinate Card",
      icon: "✦",
      description: "A hand-inked card reading 05h 35m · −05° 23′. The back says: 'for the room that refuses to stay still.'",
      sourceRoom: "observatory",
      useIn: "dream",
    });
    discoverClue("observatory-coordinate-found");
    showToast("Coordinate card added to your backpack.");
  }

  return (
    <main className={`observatory-room ${lampOn ? "is-lamp-on" : "is-lamp-off"}`}>
      <div className="obs-stars" aria-hidden="true">
        {Array.from({ length: 70 }, (_, index) => <i key={index} />)}
      </div>

      <header className="obs-header">
        <button type="button" className="obs-back" onClick={returnToHub}>← hallway</button>
        <div className="obs-title-copy">
          <small>ROOM 04 · ABOVE THE WEATHER</small>
          <h1>Observatory</h1>
          <p>somebody has been charting things that do not belong to this sky</p>
        </div>
        <button type="button" className="obs-dome-toggle" onClick={() => setDomeOpen((value) => !value)}>
          {domeOpen ? "close dome" : "open dome"}
        </button>
      </header>

      <section className="obs-scene" aria-label="Interactive observatory room">
        <div className={`obs-dome ${domeOpen ? "is-open" : "is-closed"}`} aria-hidden="true">
          <div className="obs-dome-ribs">
            {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
          </div>
          <div className="obs-dome-moon" />
          <div className="obs-shooting-star obs-shooting-star-a" />
          <div className="obs-shooting-star obs-shooting-star-b" />
        </div>

        <section className="obs-left-wall">
          <button type="button" className="obs-star-chart obs-interactive" onClick={() => setStarNote(0)}>
            <span className="obs-chart-lines" aria-hidden="true">✦ · ─ ✧ ─ · ✦<br />╲ ╱ · ╲ ╱<br />✧ ─ · ─ ✦</span>
            <strong>NORTHERN SKY</strong>
            <small>tap to inspect</small>
          </button>

          <div className="obs-reading-nook">
            <button type="button" className="obs-cushion obs-cushion-a" onClick={() => showToast("A folded blanket smells faintly of cedar and rain.")}>▰</button>
            <button type="button" className="obs-cushion obs-cushion-b" onClick={() => showToast("A tiny stitched star is hidden beneath the cushion.")}>✦</button>
            <div className="obs-side-table">
              <button type="button" className={`obs-lantern ${lampOn ? "is-on" : ""}`} onClick={() => setLampOn((value) => !value)} aria-label="Toggle lantern">
                <span>✦</span>
              </button>
              <button type="button" className="obs-teacup" onClick={() => showToast("Still warm. Whoever was here cannot have gone far.")}>☕</button>
            </div>
          </div>

          <div className="obs-ladder" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
          </div>
        </section>

        <section className="obs-center-stage">
          <div className="obs-telescope-wrap">
            <div className={`obs-telescope ${lensInstalled || lensQuestComplete ? "has-lens" : "needs-lens"}`}>
              <div className="obs-scope-barrel">
                <span className="obs-scope-end" />
                <span className="obs-scope-ring obs-scope-ring-a" />
                <span className="obs-scope-ring obs-scope-ring-b" />
                <span className="obs-scope-detail" />
              </div>
              <div className="obs-scope-gears" aria-hidden="true">
                <i /><i /><i />
              </div>
              <div className="obs-scope-mount">
                <span className="obs-mount-dial">◉</span>
              </div>
              <div className="obs-tripod">
                <i /><i /><i />
              </div>
            </div>

            <div className="obs-telescope-actions">
              {!(lensInstalled || lensQuestComplete) ? (
                <button type="button" className="obs-primary" onClick={installLens}>
                  {ownsLens ? "install telescope lens" : "missing telescope lens"}
                </button>
              ) : (
                <button type="button" className="obs-primary" onClick={() => setScopeOpen(true)}>look through telescope</button>
              )}
              <small>{lensInstalled || lensQuestComplete ? "optics calibrated" : "brass mount · 42mm empty"}</small>
            </div>
          </div>

          <div className="obs-floor-constellation" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </div>
        </section>

        <section className="obs-right-wall">
          <div className="obs-shelf">
            <div className="obs-shelf-books" aria-hidden="true">
              <span>ATLAS</span><span>ORBITS</span><span>LIGHT</span><span>NOTES</span>
            </div>
            <button type="button" className={`obs-orrery ${orreryRunning ? "is-running" : ""}`} onClick={() => setOrreryRunning((value) => !value)} aria-label="Toggle orrery">
              <span className="obs-orrery-sun" />
              <span className="obs-orbit obs-orbit-one"><i /></span>
              <span className="obs-orbit obs-orbit-two"><i /></span>
              <small>{orreryRunning ? "orrery turning" : "orrery stopped"}</small>
            </button>
          </div>

          <section className="obs-worktable">
            <button type="button" className={`obs-globe ${globeSpinning ? "is-spinning" : ""}`} onClick={spinGlobe}>
              <span className="obs-globe-sphere"><i /></span>
              <span className="obs-globe-stand" />
              <small>{globeSpinning ? "spinning..." : "spin the globe"}</small>
            </button>

            <button type="button" className="obs-journal" onClick={() => setJournalPage(0)}>
              <span>FIELD NOTES</span>
              <small>3 entries</small>
            </button>

            <div className="obs-moon-dial">
              <strong>MOON PHASE</strong>
              <div className={`obs-phase phase-${moonPhase}`} aria-hidden="true" />
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={moonPhase}
                aria-label="Moon phase dial"
                onChange={(event) => setMoonPhase(Number(event.target.value))}
              />
              <small>{["new", "waxing crescent", "first quarter", "waxing gibbous", "full", "waning gibbous", "last quarter", "waning crescent"][moonPhase]}</small>
            </div>
          </section>

          <section className="obs-star-wheel">
            <header>
              <small>CELESTIAL LOCK</small>
              <strong>turn the stars in the order from the journal</strong>
            </header>
            <div className="obs-star-wheel-buttons">
              <button type="button" className={selectedNodes.includes("north") ? "is-selected" : ""} onClick={() => chooseConstellationNode("north")}>✦<small>north</small></button>
              <button type="button" className={selectedNodes.includes("crown") ? "is-selected" : ""} onClick={() => chooseConstellationNode("crown")}>♕<small>crown</small></button>
              <button type="button" className={selectedNodes.includes("falling") ? "is-selected" : ""} onClick={() => chooseConstellationNode("falling")}>☄<small>falling</small></button>
            </div>
            <div className={`obs-hidden-drawer ${drawerOpen ? "is-open" : ""}`}>
              {drawerOpen ? (
                <>
                  <span>05h 35m · −05° 23′</span>
                  <button type="button" onClick={collectCoordinateCard}>{hasCoordinateCard ? "in backpack" : "take coordinate card"}</button>
                </>
              ) : (
                <span>three brass pins keep this drawer shut</span>
              )}
            </div>
          </section>
        </section>
      </section>

      {countryFact && (
        <aside className="obs-country-card" aria-live="polite">
          <button type="button" onClick={() => setCountryFact(null)}>×</button>
          <span className="obs-country-emoji">{countryFact.emoji}</span>
          <small>THE GLOBE LANDED ON</small>
          <h2>{countryFact.country}</h2>
          <strong>capital · {countryFact.capital}</strong>
          <p>{countryFact.fact}</p>
          <button type="button" className="obs-country-again" onClick={spinGlobe}>spin again</button>
        </aside>
      )}

      {scopeOpen && (
        <div className="obs-modal-backdrop" onMouseDown={() => setScopeOpen(false)}>
          <section className="obs-scope-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Telescope view">
            <button type="button" className="obs-modal-close" onClick={() => setScopeOpen(false)}>×</button>
            <div className="obs-scope-controls">
              {(["moon", "sun", "galaxy", "stars"] as SkyTarget[]).map((target) => (
                <button key={target} type="button" className={skyTarget === target ? "is-active" : ""} onClick={() => setSkyTarget(target)}>{target}</button>
              ))}
            </div>
            <div className={`obs-eyepiece obs-view-${skyTarget}`} style={{ "--obs-zoom": zoom } as React.CSSProperties}>
              <div className="obs-eyepiece-crosshair" />
              <div className="obs-celestial-object" />
              <div className="obs-space-stars">{Array.from({ length: 36 }, (_, index) => <i key={index} />)}</div>
              {skyTarget === "stars" && <div className="obs-view-comet" />}
            </div>
            <div className="obs-scope-caption">
              <div>
                <small>TELESCOPE VIEW</small>
                <h2>{activeSkyCopy.title}</h2>
                <p>{activeSkyCopy.subtitle}</p>
              </div>
              <label>
                zoom ×{zoom.toFixed(1)}
                <input type="range" min="1" max="2.2" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
              </label>
            </div>
          </section>
        </div>
      )}

      {journalPage !== null && (
        <div className="obs-modal-backdrop" onMouseDown={() => setJournalPage(null)}>
          <section className="obs-journal-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="obs-modal-close" onClick={() => setJournalPage(null)}>×</button>
            <div className="obs-journal-left">
              <small>OBSERVATORY LOG</small>
              <h2>{JOURNAL_PAGES[journalPage].heading}</h2>
              <p>{JOURNAL_PAGES[journalPage].body}</p>
            </div>
            <div className="obs-journal-right">
              <span className="obs-journal-sketch">☾ · ✦ · ♕ · ☄</span>
              <small>handwritten beneath the sketch</small>
              <strong>north → crown → falling</strong>
              <div className="obs-journal-nav">
                <button type="button" disabled={journalPage === 0} onClick={() => setJournalPage((value) => Math.max(0, (value ?? 0) - 1))}>← previous</button>
                <span>{journalPage + 1} / {JOURNAL_PAGES.length}</span>
                <button type="button" disabled={journalPage === JOURNAL_PAGES.length - 1} onClick={() => setJournalPage((value) => Math.min(JOURNAL_PAGES.length - 1, (value ?? 0) + 1))}>next →</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {starNote !== null && (
        <div className="obs-modal-backdrop" onMouseDown={() => setStarNote(null)}>
          <section className="obs-star-notes-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="obs-modal-close" onClick={() => setStarNote(null)}>×</button>
            <small>STAR NOTES</small>
            <h2>{STAR_NOTES[starNote].title}</h2>
            <p>{STAR_NOTES[starNote].text}</p>
            <div className="obs-star-note-picker">
              {STAR_NOTES.map((note, index) => (
                <button type="button" key={note.title} className={index === starNote ? "is-active" : ""} onClick={() => setStarNote(index)}>{note.title}</button>
              ))}
            </div>
          </section>
        </div>
      )}

      {toast && <div className="obs-toast" role="status">{toast}</div>}
    </main>
  );
}

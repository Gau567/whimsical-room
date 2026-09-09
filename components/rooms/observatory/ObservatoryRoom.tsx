"use client";

import { useMemo, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type SkyTarget = "moon" | "sun" | "galaxy" | "constellations";

type CountryFact = {
  country: string;
  emoji: string;
  capital: string;
  fact: string;
};

type Constellation = {
  id: string;
  name: string;
  nickname: string;
  season: string;
  fact: string;
  anchor: { x: number; y: number };
  stars: Array<[number, number]>;
  lines: Array<[number, number]>;
};

const COUNTRY_FACTS: CountryFact[] = [
  { country: "Singapore", emoji: "🇸🇬", capital: "Singapore", fact: "Singapore is one of the world's few city-states and has four official languages." },
  { country: "Japan", emoji: "🇯🇵", capital: "Tokyo", fact: "Japan stretches across thousands of islands and has more than 100 active volcanoes." },
  { country: "India", emoji: "🇮🇳", capital: "New Delhi", fact: "India's astronomical tradition includes the Jantar Mantar observatories, built to measure time and celestial positions." },
  { country: "Chile", emoji: "🇨🇱", capital: "Santiago", fact: "Northern Chile's exceptionally dry, dark skies are home to several of the world's major astronomical observatories." },
  { country: "Iceland", emoji: "🇮🇸", capital: "Reykjavík", fact: "Iceland lies close to the Arctic Circle, making aurora viewing possible during long dark winter nights." },
  { country: "Brazil", emoji: "🇧🇷", capital: "Brasília", fact: "Brazil is crossed by both the Equator and the Tropic of Capricorn, giving it a huge range of climates." },
  { country: "Morocco", emoji: "🇲🇦", capital: "Rabat", fact: "Morocco's Atlas Mountains create high, dry locations with remarkably clear night skies." },
  { country: "Norway", emoji: "🇳🇴", capital: "Oslo", fact: "Northern Norway lies beneath the auroral oval, one of Earth's best regions for seeing the northern lights." },
  { country: "Egypt", emoji: "🇪🇬", capital: "Cairo", fact: "Ancient Egyptian monuments show careful attention to solar cycles, cardinal directions and important stars." },
  { country: "Canada", emoji: "🇨🇦", capital: "Ottawa", fact: "Canada contains vast dark-sky regions where the Milky Way and aurora can be strikingly visible." },
  { country: "South Korea", emoji: "🇰🇷", capital: "Seoul", fact: "Cheomseongdae in Gyeongju is one of East Asia's oldest surviving astronomical observatories." },
  { country: "New Zealand", emoji: "🇳🇿", capital: "Wellington", fact: "From New Zealand, observers can see southern-sky objects such as the Southern Cross and Magellanic Clouds." },
];

const CONSTELLATIONS: Constellation[] = [
  {
    id: "orion",
    name: "Orion",
    nickname: "The Hunter",
    season: "prominent in northern winter skies",
    fact: "Orion is easy to recognize from the three nearly aligned stars of Orion's Belt. Betelgeuse marks one shoulder and Rigel one foot.",
    anchor: { x: 23, y: 59 },
    stars: [[18,38],[31,35],[24,49],[29,50],[34,51],[21,65],[38,69]],
    lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    nickname: "The Queen",
    season: "visible much of the year from northern latitudes",
    fact: "Five bright stars make Cassiopeia's famous W or M shape. It sits opposite the Big Dipper across Polaris.",
    anchor: { x: 67, y: 24 },
    stars: [[58,26],[64,20],[70,27],[77,19],[84,25]],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    nickname: "The Great Bear",
    season: "circumpolar for many northern observers",
    fact: "Its best-known pattern is the Big Dipper. The two outer bowl stars point toward Polaris, the North Star.",
    anchor: { x: 70, y: 63 },
    stars: [[59,58],[65,55],[71,58],[76,63],[82,60],[87,55],[91,58]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    id: "cygnus",
    name: "Cygnus",
    nickname: "The Swan",
    season: "a classic northern summer constellation",
    fact: "Cygnus forms the Northern Cross. Its brightest star, Deneb, is one corner of the large Summer Triangle.",
    anchor: { x: 45, y: 23 },
    stars: [[44,11],[44,21],[44,31],[44,42],[34,26],[55,26]],
    lines: [[0,1],[1,2],[2,3],[4,2],[2,5]],
  },
  {
    id: "leo",
    name: "Leo",
    nickname: "The Lion",
    season: "best known as a northern spring constellation",
    fact: "Leo's head and mane form a backward question-mark pattern called the Sickle. Regulus sits near its base.",
    anchor: { x: 39, y: 76 },
    stars: [[31,71],[35,66],[40,67],[43,72],[40,78],[48,79],[55,75]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,6]],
  },
  {
    id: "scorpius",
    name: "Scorpius",
    nickname: "The Scorpion",
    season: "prominent in summer skies",
    fact: "Scorpius curves like a hook around the reddish star Antares, whose name means 'rival of Mars'.",
    anchor: { x: 76, y: 81 },
    stars: [[68,72],[72,76],[76,78],[80,80],[84,84],[87,88],[83,91],[79,90]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
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

const MOON_PHASES = ["new", "waxing crescent", "first quarter", "waxing gibbous", "full", "waning gibbous", "last quarter", "waning crescent"];

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

  const [lanternsOn, setLanternsOn] = useState(true);
  const [domeOpen, setDomeOpen] = useState(true);
  const [lensInstalled, setLensInstalled] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [skyTarget, setSkyTarget] = useState<SkyTarget>("constellations");
  const [zoom, setZoom] = useState(1);
  const [countryFact, setCountryFact] = useState<CountryFact | null>(null);
  const [globeSpinning, setGlobeSpinning] = useState(false);
  const [journalPage, setJournalPage] = useState<number | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<ConstellationNode[]>([]);
  const [constellationSolved, setConstellationSolved] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orreryRunning, setOrreryRunning] = useState(true);
  const [moonPhase, setMoonPhase] = useState(3);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<Constellation | null>(null);
  const [foundConstellations, setFoundConstellations] = useState<string[]>([]);
  const [chartOpen, setChartOpen] = useState(false);

  const ownsLens = hasItem("telescope-lens");
  const hasCoordinateCard = hasItem("celestial-coordinate-card");
  const lensQuestComplete = isQuestComplete("observatory-missing-lens");
  const scopeReady = lensInstalled || lensQuestComplete;

  const activeSkyCopy = useMemo(() => {
    const copy: Record<SkyTarget, { title: string; subtitle: string }> = {
      moon: { title: "The Moon", subtitle: "craters, maria and a very quiet horizon" },
      sun: { title: "The Sun", subtitle: "filtered solar view · never observe the Sun directly without proper equipment" },
      galaxy: { title: "Andromeda Galaxy", subtitle: "a neighboring spiral galaxy roughly 2.5 million light-years away" },
      constellations: { title: "Constellation Hunt", subtitle: `${foundConstellations.length} / ${CONSTELLATIONS.length} identified · click patterns in the sky` },
    };
    return copy[skyTarget];
  }, [skyTarget, foundConstellations.length]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2300);
  }

  function installLens() {
    if (scopeReady) {
      setLensInstalled(true);
      showToast("The brass lens is already seated in the telescope.");
      return;
    }

    if (!ownsLens) {
      showToast("The telescope's brass lens mount is empty. Check your backpack — or the Study.");
      return;
    }

    setLensInstalled(true);
    removeItem("telescope-lens");
    completeQuest("observatory-missing-lens");
    discoverClue("observatory-lens-installed");
    showToast("The lens clicks into place. Stars sharpen into pinpoints.");
  }

  function spinGlobe() {
    if (globeSpinning) return;
    setGlobeSpinning(true);
    setCountryFact(null);

    window.setTimeout(() => {
      const next = COUNTRY_FACTS[Math.floor(Math.random() * COUNTRY_FACTS.length)];
      setCountryFact(next);
      setGlobeSpinning(false);
    }, 1000);
  }

  function inspectConstellation(constellation: Constellation) {
    setSelectedConstellation(constellation);
    setFoundConstellations((current) => current.includes(constellation.id) ? current : [...current, constellation.id]);

    if (!foundConstellations.includes(constellation.id)) {
      showToast(`${constellation.name} identified.`);
    }
  }

  function chooseConstellationNode(node: ConstellationNode) {
    if (constellationSolved) return;
    const expected = CONSTELLATION_ORDER[selectedNodes.length];

    if (node !== expected) {
      setSelectedNodes([]);
      showToast("The brass wheel slips back to its starting position.");
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
    <main className={`observatory-v2 ${lanternsOn ? "is-lit" : "is-dim"}`}>
      <header className="obs-v2-header">
        <button type="button" onClick={returnToHub}>← hallway</button>
        <div>
          <small>ROOM 04 · ABOVE THE WEATHER</small>
          <h1>Observatory</h1>
          <p>maps, brass instruments, and too many stars to leave unnamed</p>
        </div>
        <button type="button" onClick={() => setDomeOpen((value) => !value)}>{domeOpen ? "close dome" : "open dome"}</button>
      </header>

      <section className="obs-v2-room">
        <div className={`obs-v2-dome ${domeOpen ? "is-open" : "is-closed"}`}>
          <div className="obs-v2-night-sky" aria-hidden="true">
            {Array.from({ length: 90 }, (_, index) => <i key={index} />)}
            <span className="obs-v2-moon" />
            <span className="obs-v2-shooting-star shooting-a" />
            <span className="obs-v2-shooting-star shooting-b" />
            <span className="obs-v2-dome-constellation dome-orion">✦ · · ✦<br /> · ✦ ·<br />✦ · · ✦</span>
            <span className="obs-v2-dome-constellation dome-cass">· ✦ · ✦ · ✦</span>
          </div>
          <div className="obs-v2-ribs" aria-hidden="true">{Array.from({ length: 11 }, (_, index) => <i key={index} />)}</div>
        </div>

        <div className="obs-v2-hanging-stars" aria-hidden="true"><i>★</i><i>★</i><i>★</i></div>

        <aside className="obs-v2-left-library">
          <div className="obs-v2-bookcase">
            <div className="obs-v2-books top-books" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <button type="button" className="obs-v2-wall-chart" onClick={() => setChartOpen(true)}>
              <svg viewBox="0 0 200 160" aria-hidden="true">
                <circle cx="100" cy="80" r="62" />
                <path d="M36 98 L61 67 L88 75 L111 44 L139 72 L162 54" />
                <path d="M48 45 L79 53 L104 91 L132 111 L156 96" />
                <g><circle cx="36" cy="98" r="3"/><circle cx="61" cy="67" r="3"/><circle cx="88" cy="75" r="3"/><circle cx="111" cy="44" r="3"/><circle cx="139" cy="72" r="3"/><circle cx="162" cy="54" r="3"/></g>
              </svg>
              <strong>STAR ATLAS</strong><small>six patterns are marked</small>
            </button>
            <div className="obs-v2-books bottom-books" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <button type="button" className="obs-v2-lantern" onClick={() => setLanternsOn((value) => !value)} aria-label="Toggle observatory lanterns"><span>✦</span></button>
          </div>

          <div className="obs-v2-lounge">
            <button type="button" className="obs-v2-chair chair-left" onClick={() => showToast("A pencil is wedged between the cushions. Someone fell asleep mid-calculation.")}><span /></button>
            <button type="button" className="obs-v2-chair chair-right" onClick={() => showToast("The blanket has tiny stitched constellations along the edge.")}><span /></button>
            <div className="obs-v2-plant" aria-hidden="true">♧</div>
            <button type="button" className="obs-v2-tea" onClick={() => showToast("Still warm. Astronomers apparently survive on tea and questionable sleep schedules.")}>☕</button>
          </div>
        </aside>

        <div className="obs-v2-ladder" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>

        <section className="obs-v2-center">
          <div className={`obs-v2-telescope ${scopeReady ? "is-ready" : "needs-lens"}`}>
            <div className="obs-v2-telescope-tube">
              <span className="scope-bell" />
              <span className="scope-ring ring-a" />
              <span className="scope-ring ring-b" />
              <span className="scope-lens" />
              <span className="scope-smallfinder" />
            </div>
            <div className="obs-v2-brass-gears" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="obs-v2-mount"><span>◉</span></div>
            <div className="obs-v2-tripod"><i /><i /><i /></div>
          </div>
          <div className="obs-v2-scope-actions">
            {!scopeReady ? (
              <button type="button" onClick={installLens}>{ownsLens ? "install brass lens" : "lens mount is empty"}</button>
            ) : (
              <button type="button" onClick={() => setScopeOpen(true)}>look through telescope</button>
            )}
            <small>{scopeReady ? "optics calibrated · sky chart ready" : "42mm brass mount · missing optics"}</small>
          </div>
        </section>

        <aside className="obs-v2-right-library">
          <div className="obs-v2-shelf-top">
            <div className="obs-v2-mini-books" aria-hidden="true"><i>ATLAS</i><i>ORBITS</i><i>LIGHT</i><i>NOTES</i></div>
            <button type="button" className={`obs-v2-orrery ${orreryRunning ? "is-running" : ""}`} onClick={() => setOrreryRunning((value) => !value)}>
              <span className="orrery-sun"/><span className="orrery-orbit orbit-1"><i /></span><span className="orrery-orbit orbit-2"><i /></span><small>{orreryRunning ? "turning" : "paused"}</small>
            </button>
          </div>

          <div className="obs-v2-desk">
            <button type="button" className={`obs-v2-globe ${globeSpinning ? "is-spinning" : ""}`} onClick={spinGlobe}>
              <span className="globe-meridian" />
              <span className="globe-ball">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle cx="60" cy="60" r="53" />
                  <path d="M23 39 C34 25 47 27 52 35 C61 29 76 30 82 39 C74 46 68 50 64 59 C53 56 47 51 38 53 C31 49 27 45 23 39Z" />
                  <path d="M72 68 C80 62 94 66 99 76 C93 88 82 95 72 91 C67 83 68 75 72 68Z" />
                  <path d="M34 72 C42 67 51 70 55 80 C52 91 44 99 36 95 C30 87 30 79 34 72Z" />
                  <path className="globe-lat" d="M11 60 H109 M17 39 C45 48 75 48 103 39 M17 81 C45 72 75 72 103 81" />
                </svg>
              </span>
              <span className="globe-axis" />
              <span className="globe-stem" />
              <span className="globe-foot" />
              <small>{globeSpinning ? "spinning..." : "spin for a country"}</small>
            </button>

            <button type="button" className="obs-v2-journal" onClick={() => setJournalPage(0)}><span>FIELD NOTES</span><small>3 entries</small></button>

            <div className="obs-v2-moon-phase">
              <strong>MOON PHASE</strong>
              <div className={`obs-v2-phase phase-${moonPhase}`} aria-hidden="true"><span /></div>
              <input type="range" min="0" max="7" step="1" value={moonPhase} onChange={(event) => setMoonPhase(Number(event.target.value))} aria-label="Moon phase" />
              <small>{MOON_PHASES[moonPhase]}</small>
            </div>
          </div>

          <section className="obs-v2-celestial-lock">
            <header><small>CELESTIAL LOCK</small><strong>journal order · three brass pins</strong></header>
            <div className="obs-v2-lock-buttons">
              <button type="button" className={selectedNodes.includes("north") ? "is-selected" : ""} onClick={() => chooseConstellationNode("north")}>✦<small>north</small></button>
              <button type="button" className={selectedNodes.includes("crown") ? "is-selected" : ""} onClick={() => chooseConstellationNode("crown")}>♕<small>crown</small></button>
              <button type="button" className={selectedNodes.includes("falling") ? "is-selected" : ""} onClick={() => chooseConstellationNode("falling")}>☄<small>falling</small></button>
            </div>
            <div className={`obs-v2-hidden-drawer ${drawerOpen ? "is-open" : ""}`}>
              {drawerOpen ? <><span>05h 35m · −05° 23′</span><button type="button" onClick={collectCoordinateCard}>{hasCoordinateCard ? "in backpack" : "take coordinate card"}</button></> : <span>the drawer refuses to move</span>}
            </div>
          </section>
        </aside>

        <div className="obs-v2-rug" aria-hidden="true" />
      </section>

      {countryFact && (
        <aside className="obs-v2-country-card" aria-live="polite">
          <button type="button" className="obs-v2-card-close" onClick={() => setCountryFact(null)}>×</button>
          <span>{countryFact.emoji}</span><small>THE GLOBE LANDED ON</small><h2>{countryFact.country}</h2><strong>capital · {countryFact.capital}</strong><p>{countryFact.fact}</p><button type="button" onClick={spinGlobe}>spin again</button>
        </aside>
      )}

      {scopeOpen && (
        <div className="obs-v2-modal-backdrop" onMouseDown={() => setScopeOpen(false)}>
          <section className="obs-v2-scope-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Telescope view">
            <button type="button" className="obs-v2-modal-close" onClick={() => setScopeOpen(false)}>×</button>
            <div className="obs-v2-scope-tabs">
              {(["moon", "sun", "galaxy", "constellations"] as SkyTarget[]).map((target) => <button key={target} type="button" className={skyTarget === target ? "is-active" : ""} onClick={() => { setSkyTarget(target); setSelectedConstellation(null); }}>{target}</button>)}
            </div>

            <div className="obs-v2-scope-layout">
              <div className={`obs-v2-eyepiece view-${skyTarget}`}>
                <div className="obs-v2-crosshair" />
                <div className="obs-v2-space-dust" aria-hidden="true">{Array.from({ length: 80 }, (_, index) => <i key={index} />)}</div>
                {skyTarget === "moon" && <div className="obs-v2-moon-view" style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}><i /><i /><i /><i /></div>}
                {skyTarget === "sun" && <div className="obs-v2-sun-view" style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}><i /><i /><i /></div>}
                {skyTarget === "galaxy" && <div className="obs-v2-galaxy-view" style={{ transform: `translate(-50%, -50%) rotate(-18deg) scale(${zoom})` }}><i /><i /><i /></div>}
                {skyTarget === "constellations" && (
                  <>
                    <svg className="obs-v2-constellation-svg" viewBox="0 0 100 100" aria-hidden="true">
                      {CONSTELLATIONS.map((constellation) => (
                        <g key={constellation.id} className={foundConstellations.includes(constellation.id) ? "is-found" : ""}>
                          {constellation.lines.map(([from, to], index) => {
                            const start = constellation.stars[from];
                            const end = constellation.stars[to];
                            return <line key={index} x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} />;
                          })}
                          {constellation.stars.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === 0 ? 0.72 : 0.52} />)}
                        </g>
                      ))}
                    </svg>
                    {CONSTELLATIONS.map((constellation) => (
                      <button key={constellation.id} type="button" className={`obs-v2-constellation-hotspot ${foundConstellations.includes(constellation.id) ? "is-found" : ""}`} style={{ left: `${constellation.anchor.x}%`, top: `${constellation.anchor.y}%` }} onClick={() => inspectConstellation(constellation)} aria-label={`Inspect ${constellation.name}`}>
                        <span>{foundConstellations.includes(constellation.id) ? constellation.name : "?"}</span>
                      </button>
                    ))}
                    <div className="obs-v2-comet" />
                  </>
                )}
              </div>

              <aside className="obs-v2-scope-info">
                <small>TELESCOPE VIEW</small>
                <h2>{activeSkyCopy.title}</h2>
                <p>{activeSkyCopy.subtitle}</p>
                {skyTarget === "constellations" ? (
                  selectedConstellation ? <div className="obs-v2-constellation-card"><small>IDENTIFIED</small><h3>{selectedConstellation.name}</h3><strong>{selectedConstellation.nickname}</strong><p>{selectedConstellation.fact}</p><span>{selectedConstellation.season}</span></div> : <div className="obs-v2-hunt-hint"><strong>Find the patterns.</strong><p>Six constellations are drawn among the field stars. Click near a pattern to identify it and reveal its story.</p></div>
                ) : (
                  <div className="obs-v2-object-note">
                    {skyTarget === "moon" && <p>The dark plains are lunar maria: ancient lava-filled basins that early observers mistook for seas.</p>}
                    {skyTarget === "sun" && <p>The darker flecks are sunspots, cooler regions associated with intense magnetic activity.</p>}
                    {skyTarget === "galaxy" && <p>Andromeda is the nearest large spiral galaxy to the Milky Way and is visible to the naked eye under dark skies.</p>}
                  </div>
                )}
                <label>zoom ×{zoom.toFixed(1)}<input type="range" min="1" max="2.1" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
              </aside>
            </div>
          </section>
        </div>
      )}

      {journalPage !== null && (
        <div className="obs-v2-modal-backdrop" onMouseDown={() => setJournalPage(null)}>
          <section className="obs-v2-journal-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="obs-v2-modal-close dark-close" onClick={() => setJournalPage(null)}>×</button>
            <article><small>OBSERVATORY FIELD JOURNAL</small><h2>{JOURNAL_PAGES[journalPage].heading}</h2><p>{JOURNAL_PAGES[journalPage].body}</p></article>
            <aside><span>✦ · ♕ · ☄</span><strong>NORTH → CROWN → FALLING</strong><div><button type="button" disabled={journalPage === 0} onClick={() => setJournalPage((page) => Math.max(0, (page ?? 0) - 1))}>← previous</button><small>{journalPage + 1} / {JOURNAL_PAGES.length}</small><button type="button" disabled={journalPage === JOURNAL_PAGES.length - 1} onClick={() => setJournalPage((page) => Math.min(JOURNAL_PAGES.length - 1, (page ?? 0) + 1))}>next →</button></div></aside>
          </section>
        </div>
      )}

      {chartOpen && (
        <div className="obs-v2-modal-backdrop" onMouseDown={() => setChartOpen(false)}>
          <section className="obs-v2-chart-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="obs-v2-modal-close" onClick={() => setChartOpen(false)}>×</button>
            <small>PINNED STAR ATLAS</small><h2>Patterns somebody expected you to notice</h2><div>{CONSTELLATIONS.map((constellation) => <button key={constellation.id} type="button" onClick={() => { setChartOpen(false); if (scopeReady) { setSkyTarget("constellations"); setScopeOpen(true); setSelectedConstellation(constellation); } else { showToast("The atlas matches the telescope — once its lens is repaired."); } }}><strong>{constellation.name}</strong><span>{constellation.nickname}</span></button>)}</div>
          </section>
        </div>
      )}

      {toast && <div className="obs-v2-toast" role="status">{toast}</div>}
    </main>
  );
}

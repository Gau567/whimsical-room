"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWorld } from "@/lib/world/WorldContext";

type CountryFact = {
  country: string;
  emoji: string;
  capital: string;
  fact: string;
  skyFact: string;
};

type BookInfo = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  note: string;
};

type SkyPoint = { x: number; y: number };

type Constellation = {
  id: string;
  name: string;
  nickname: string;
  season: string;
  fact: string;
  stars: SkyPoint[];
  lines: Array<[number, number]>;
  anchor: SkyPoint;
};

type SkyObject = {
  id: string;
  name: string;
  kind: "moon" | "galaxy" | "cluster" | "star" | "mystery";
  x: number;
  y: number;
  minZoom: number;
  short: string;
  detail: string;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startCenterX: number;
  startCenterY: number;
};

const SKY_WIDTH = 220;
const SKY_HEIGHT = 140;
const BASE_VIEW_WIDTH = 108;
const BASE_VIEW_HEIGHT = 76;

const COUNTRY_FACTS: CountryFact[] = [
  { country: "Singapore", emoji: "🇸🇬", capital: "Singapore", fact: "Singapore is a compact island city-state near the equator with four official languages.", skyFact: "Its equatorial latitude lets observers see parts of both the northern and southern celestial hemispheres during the year." },
  { country: "Japan", emoji: "🇯🇵", capital: "Tokyo", fact: "Japan is an island country stretching from cool northern latitudes to the subtropics.", skyFact: "Japanese astronomy has centuries of star maps, calendars and careful records of comets and unusual celestial events." },
  { country: "India", emoji: "🇮🇳", capital: "New Delhi", fact: "India has a long astronomical tradition, including monumental Jantar Mantar instruments built for naked-eye measurements.", skyFact: "Across India, seasonal skies include familiar northern constellations as well as rich Milky Way fields." },
  { country: "Chile", emoji: "🇨🇱", capital: "Santiago", fact: "Chile runs along the Pacific side of South America and includes some of the driest landscapes on Earth.", skyFact: "The Atacama Desert hosts major observatories because of its altitude, dry air and unusually clear skies." },
  { country: "Iceland", emoji: "🇮🇸", capital: "Reykjavík", fact: "Iceland is a volcanic island in the North Atlantic, close to the Arctic Circle.", skyFact: "Long, dark winter nights can provide excellent aurora viewing when clouds and solar activity cooperate." },
  { country: "Brazil", emoji: "🇧🇷", capital: "Brasília", fact: "Brazil is the largest country in South America and crosses both the Equator and Tropic of Capricorn.", skyFact: "Much of Brazil has excellent access to southern-sky constellations that sit low or remain invisible from far northern latitudes." },
  { country: "Norway", emoji: "🇳🇴", capital: "Oslo", fact: "Norway stretches far north into the Arctic and has a famously long, deeply indented coastline.", skyFact: "Northern Norway lies beneath the auroral oval, making it a renowned place to watch the northern lights." },
  { country: "Egypt", emoji: "🇪🇬", capital: "Cairo", fact: "Ancient Egyptian architecture and calendars paid close attention to the Sun, stars and cardinal directions.", skyFact: "Sirius was especially important historically because its seasonal appearance was tied to the Nile cycle." },
  { country: "South Korea", emoji: "🇰🇷", capital: "Seoul", fact: "South Korea preserves Cheomseongdae, one of East Asia's oldest surviving astronomical observatories.", skyFact: "Historical Korean records include detailed observations of comets, eclipses and temporary 'guest stars'." },
  { country: "New Zealand", emoji: "🇳🇿", capital: "Wellington", fact: "New Zealand lies in the southwest Pacific and is famous for dramatic mountains, coastlines and dark rural skies.", skyFact: "Observers can see the Southern Cross, Magellanic Clouds and other southern objects unavailable from much of the Northern Hemisphere." },
  { country: "Australia", emoji: "🇦🇺", capital: "Canberra", fact: "Australia spans tropical, desert and temperate regions across an entire continent.", skyFact: "Its southern latitude gives excellent views of the Southern Cross, Centaurus and the Magellanic Clouds." },
  { country: "South Africa", emoji: "🇿🇦", capital: "Pretoria", fact: "South Africa contains deserts, grasslands, mountains and long Atlantic and Indian Ocean coastlines.", skyFact: "Its southern skies are used by major observatories, including facilities near Sutherland in the Karoo." },
  { country: "United States", emoji: "🇺🇸", capital: "Washington, D.C.", fact: "The United States spans a huge range of latitudes, climates and landscapes.", skyFact: "From Hawaii's high volcanic summits to Arizona's deserts, the country contains several internationally important observing sites." },
  { country: "Canada", emoji: "🇨🇦", capital: "Ottawa", fact: "Canada stretches from the Atlantic to the Pacific and deep into the Arctic.", skyFact: "Large northern areas sit beneath strong auroral activity, while dark rural skies make circumpolar constellations easy to follow." },
  { country: "Mexico", emoji: "🇲🇽", capital: "Mexico City", fact: "Mexico combines high plateaus, deserts, mountains and tropical coastlines.", skyFact: "High-altitude sites can offer clear views of both northern constellations and objects nearer the celestial equator." },
  { country: "Peru", emoji: "🇵🇪", capital: "Lima", fact: "Peru stretches from Pacific desert to the Andes and Amazon basin.", skyFact: "Andean cultures developed sophisticated sky traditions, including attention to both bright stars and dark shapes within the Milky Way." },
  { country: "Argentina", emoji: "🇦🇷", capital: "Buenos Aires", fact: "Argentina extends from subtropical South America far into cool Patagonia.", skyFact: "Southern Argentina offers excellent access to the Milky Way's southern regions and constellations around the south celestial pole." },
  { country: "France", emoji: "🇫🇷", capital: "Paris", fact: "France has played a major role in the history of mathematics, physics and astronomy.", skyFact: "The Paris Observatory, founded in the seventeenth century, became one of Europe's major astronomical institutions." },
  { country: "United Kingdom", emoji: "🇬🇧", capital: "London", fact: "The United Kingdom has a long maritime and scientific history closely linked to navigation.", skyFact: "Greenwich became the reference for the prime meridian and Greenwich Mean Time, deeply connecting astronomy with global timekeeping." },
  { country: "Greece", emoji: "🇬🇷", capital: "Athens", fact: "Ancient Greek scholars helped shape early Western models of geometry, planetary motion and the heavens.", skyFact: "Many constellation names used today come through Greek mythology, including Orion, Cassiopeia and Andromeda." },
  { country: "Turkey", emoji: "🇹🇷", capital: "Ankara", fact: "Turkey bridges southeastern Europe and western Asia.", skyFact: "The region has a long history of astronomical scholarship, including observatories and star catalogues from the medieval Islamic world." },
  { country: "United Arab Emirates", emoji: "🇦🇪", capital: "Abu Dhabi", fact: "The UAE combines modern cities with extensive desert landscapes.", skyFact: "Desert areas away from city lights can offer broad horizons and very clear views of the Moon, planets and winter constellations." },
  { country: "Indonesia", emoji: "🇮🇩", capital: "Jakarta", fact: "Indonesia is a vast equatorial archipelago made up of thousands of islands.", skyFact: "Near-equatorial skies allow observers to see a wide mix of northern and southern constellations across the year." },
  { country: "Philippines", emoji: "🇵🇭", capital: "Manila", fact: "The Philippines is an archipelago in the western Pacific made up of thousands of islands.", skyFact: "Its tropical latitude gives access to Orion, Scorpius, the Southern Cross and many Milky Way fields in different seasons." },
  { country: "Thailand", emoji: "🇹🇭", capital: "Bangkok", fact: "Thailand stretches from mountainous northern regions to tropical southern coasts.", skyFact: "At its latitude, observers can follow many northern constellations while still seeing southern objects rise above the horizon." },
  { country: "Kenya", emoji: "🇰🇪", capital: "Nairobi", fact: "Kenya lies across the equator and contains highlands, savannahs and the Great Rift Valley.", skyFact: "Equatorial observers can watch stars from both celestial hemispheres, with the celestial poles sitting near opposite horizons." },
];

const CONSTELLATIONS: Constellation[] = [
  {
    id: "orion", name: "Orion", nickname: "The Hunter", season: "northern winter",
    fact: "Look for the three aligned stars of Orion's Belt. Betelgeuse marks a shoulder and Rigel a foot.",
    anchor: { x: 58, y: 80 },
    stars: [{x:49,y:65},{x:65,y:63},{x:54,y:76},{x:59,y:77},{x:64,y:78},{x:50,y:94},{x:69,y:97}],
    lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
  },
  {
    id: "cassiopeia", name: "Cassiopeia", nickname: "The Queen", season: "northern autumn and winter",
    fact: "Five bright stars form Cassiopeia's unmistakable W or M shape.",
    anchor: { x: 142, y: 35 },
    stars: [{x:126,y:38},{x:134,y:29},{x:143,y:39},{x:153,y:27},{x:165,y:36}],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: "ursa-major", name: "Ursa Major", nickname: "The Great Bear", season: "circumpolar in many northern skies",
    fact: "The Big Dipper is part of Ursa Major. Its outer bowl stars point toward Polaris.",
    anchor: { x: 170, y: 77 },
    stars: [{x:148,y:72},{x:157,y:67},{x:166,y:71},{x:174,y:78},{x:184,y:74},{x:194,y:67},{x:204,y:72}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    id: "cygnus", name: "Cygnus", nickname: "The Swan", season: "northern summer",
    fact: "Cygnus forms the Northern Cross. Deneb is one corner of the Summer Triangle.",
    anchor: { x: 101, y: 34 },
    stars: [{x:101,y:16},{x:101,y:28},{x:101,y:40},{x:101,y:54},{x:88,y:35},{x:116,y:35}],
    lines: [[0,1],[1,2],[2,3],[4,2],[2,5]],
  },
  {
    id: "leo", name: "Leo", nickname: "The Lion", season: "northern spring",
    fact: "Leo's head forms a backward question-mark called the Sickle. Regulus sits near its base.",
    anchor: { x: 92, y: 111 },
    stars: [{x:75,y:107},{x:81,y:99},{x:90,y:101},{x:96,y:108},{x:91,y:118},{x:107,y:119},{x:121,y:112}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,6]],
  },
  {
    id: "scorpius", name: "Scorpius", nickname: "The Scorpion", season: "northern summer",
    fact: "Scorpius curves around reddish Antares, whose name means 'rival of Mars'.",
    anchor: { x: 173, y: 117 },
    stars: [{x:151,y:103},{x:159,y:109},{x:169,y:112},{x:178,y:115},{x:188,y:121},{x:197,y:129},{x:189,y:135},{x:180,y:132}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
  },
];

const SKY_OBJECTS: SkyObject[] = [
  { id: "moon", name: "The Moon", kind: "moon", x: 28, y: 25, minZoom: 1, short: "Earth's natural satellite", detail: "The dark plains are lunar maria: enormous ancient lava flows visible from Earth." },
  { id: "andromeda", name: "Andromeda Galaxy", kind: "galaxy", x: 193, y: 28, minZoom: 1.15, short: "M31 · neighboring spiral galaxy", detail: "Andromeda is the nearest large galaxy to the Milky Way and appears as a soft elongated glow under dark skies." },
  { id: "pleiades", name: "Pleiades", kind: "cluster", x: 30, y: 113, minZoom: 1.35, short: "M45 · open star cluster", detail: "The Pleiades are a young nearby cluster in Taurus. Several bright blue-white members are visible to the naked eye." },
  { id: "polaris", name: "Polaris", kind: "star", x: 113, y: 11, minZoom: 1.7, short: "The North Star", detail: "Polaris lies close to the north celestial pole, so the northern sky appears to rotate around it." },
  { id: "betelgeuse", name: "Betelgeuse", kind: "star", x: 49, y: 65, minZoom: 1.8, short: "Red supergiant in Orion", detail: "Betelgeuse is a huge evolved star whose warm colour is noticeably different from many nearby blue-white stars." },
  { id: "rigel", name: "Rigel", kind: "star", x: 69, y: 97, minZoom: 1.8, short: "Blue supergiant in Orion", detail: "Rigel is one of Orion's brightest stars and marks the Hunter's foot." },
  { id: "unknown", name: "Uncatalogued Object", kind: "mystery", x: 214, y: 126, minZoom: 2.25, short: "OBJECT NOT IN CATALOGUE", detail: "It shifts slightly between observations. The journal contains no matching entry." },
];

const OBSERVATORY_BOOKS: BookInfo[] = [
  { id: "atlas", title: "ATLAS", subtitle: "A Pocket Atlas of the Northern Sky", description: "A compact field guide for locating seasonal constellations. The pages use simple landmark patterns rather than detailed star charts.", note: "Useful trick: find one unmistakable shape first, then hop from bright star to bright star." },
  { id: "orbits", title: "ORBITS", subtitle: "Clockwork Heavens", description: "Notes on how planets, moons and comets move under gravity. Several pages compare elliptical orbits with the brass orrery on the shelf.", note: "The farther an orbiting body is from its star, the longer one complete trip usually takes." },
  { id: "light", title: "LIGHT", subtitle: "What Starlight Can Tell Us", description: "An introduction to colour, spectra and brightness. It explains how astronomers can learn about temperature and composition without ever touching a star.", note: "Blue-white stars are generally hotter at their surfaces than orange-red stars." },
  { id: "notes", title: "NOTES", subtitle: "Observatory Night Log", description: "Loose observations from previous nights: cloud cover, seeing conditions, strange noises in the dome and objects worth revisiting.", note: "A margin entry is underlined twice: 'If it moves between charts, log the time.'" },
  { id: "maps", title: "MAPS", subtitle: "Celestial Coordinates", description: "A practical guide to right ascension and declination—the sky's equivalent of longitude and latitude.", note: "Right ascension is measured in hours; declination is measured north or south of the celestial equator." },
  { id: "stars", title: "STARS", subtitle: "Lives of Stars", description: "A beginner-friendly guide to stellar evolution, from protostars to red giants, white dwarfs and supernova remnants.", note: "A star's mass strongly affects how quickly it burns fuel and how its life ends." },
  { id: "comets", title: "COMETS", subtitle: "Visitors from the Outer Dark", description: "Sketches of comet nuclei, tails and long elliptical paths. Several pages track famous historical comet appearances.", note: "A comet's tail points broadly away from the Sun because of sunlight and the solar wind." },
  { id: "optics", title: "OPTICS", subtitle: "Lenses, Mirrors & Focus", description: "A maintenance handbook for refracting telescopes: focal length, magnification, lens alignment and why too much magnification can make an image worse.", note: "Sharpness depends on the atmosphere and optics—not just on turning the zoom higher." },
  { id: "time", title: "TIME", subtitle: "Keeping Time by the Sky", description: "A small history of sundials, sidereal time, meridians and why astronomers care about precise clocks.", note: "A sidereal day is slightly shorter than a solar day because Earth moves along its orbit while it rotates." },
];

const JOURNAL_PAGES = [
  { heading: "Observation 17", body: "The missing brass lens was moved downstairs after the storm. Without it, the telescope shows only a soft circle of light." },
  { heading: "Observation 18", body: "The celestial lock responds in order: North Star, three-point crown, then the little falling star." },
  { heading: "Observation 19", body: "Coordinate copied from the gear housing: 05h 35m · −05° 23′. I hid the card in the celestial drawer." },
];

const CONSTELLATION_ORDER = ["north", "crown", "falling"] as const;
type ConstellationNode = (typeof CONSTELLATION_ORDER)[number];
const MOON_PHASES = ["new", "waxing crescent", "first quarter", "waxing gibbous", "full", "waning gibbous", "last quarter", "waning crescent"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function MoonPhaseVisual({ phase }: { phase: number }) {
  const safePhase = clamp(phase, 0, 7);
  const illuminated = [0.02, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25][safePhase];
  const waxing = safePhase <= 4;
  const radius = 44;
  const litWidth = Math.max(2, illuminated * radius * 2);
  const litX = waxing ? radius * 2 - litWidth : 0;

  return (
    <svg className={`moon-phase-svg phase-${safePhase}`} viewBox="0 0 100 100" aria-label={`Moon phase: ${MOON_PHASES[safePhase]}`} role="img">
      <defs>
        <clipPath id="obsMoonClip"><circle cx="50" cy="50" r="44" /></clipPath>
        <radialGradient id="obsMoonGlow" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#fff5c9" />
          <stop offset="1" stopColor="#e7d7aa" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill="#162640" />
      {safePhase === 4 ? (
        <circle cx="50" cy="50" r="44" fill="url(#obsMoonGlow)" />
      ) : safePhase !== 0 ? (
        <g clipPath="url(#obsMoonClip)">
          <rect x={litX} y="6" width={litWidth} height="88" fill="url(#obsMoonGlow)" />
          <ellipse
            cx={waxing ? litX : litWidth}
            cy="50"
            rx={Math.max(2, 18 + Math.abs(0.5 - illuminated) * 30)}
            ry="44"
            fill={[1, 2, 3].includes(safePhase) ? "#162640" : "url(#obsMoonGlow)"}
            opacity="0.72"
          />
        </g>
      ) : null}
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" />
    </svg>
  );
}

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
  const [projectorOn, setProjectorOn] = useState(false);
  const [lensInstalled, setLensInstalled] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [zoom, setZoom] = useState(1.15);
  const [skyCenter, setSkyCenter] = useState({ x: 110, y: 70 });
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
  const [foundObjects, setFoundObjects] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<SkyObject | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState<BookInfo | null>(null);
  const [catMood, setCatMood] = useState(0);
  const [wishCount, setWishCount] = useState(0);

  const dragRef = useRef<DragState | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const ownsLens = hasItem("telescope-lens");
  const hasCoordinateCard = hasItem("celestial-coordinate-card");
  const lensQuestComplete = isQuestComplete("observatory-missing-lens");
  const scopeReady = lensInstalled || lensQuestComplete;

  const viewSize = useMemo(() => ({
    width: BASE_VIEW_WIDTH / zoom,
    height: BASE_VIEW_HEIGHT / zoom,
  }), [zoom]);

  const viewBox = useMemo(() => ({
    x: clamp(skyCenter.x - viewSize.width / 2, 0, SKY_WIDTH - viewSize.width),
    y: clamp(skyCenter.y - viewSize.height / 2, 0, SKY_HEIGHT - viewSize.height),
    width: viewSize.width,
    height: viewSize.height,
  }), [skyCenter, viewSize]);

  const coordinates = useMemo(() => {
    const raHours = (skyCenter.x / SKY_WIDTH) * 24;
    const dec = 90 - (skyCenter.y / SKY_HEIGHT) * 180;
    const hours = Math.floor(raHours);
    const minutes = Math.floor((raHours - hours) * 60);
    const sign = dec >= 0 ? "+" : "−";
    return `RA ${String(hours).padStart(2,"0")}h ${String(minutes).padStart(2,"0")}m · DEC ${sign}${Math.abs(dec).toFixed(1)}°`;
  }, [skyCenter]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function installLens() {
    if (scopeReady) {
      setLensInstalled(true);
      showToast("The brass lens is already seated in the telescope.");
      return;
    }
    if (!ownsLens) {
      showToast("The lens mount is empty. The missing lens was last seen in the Midnight Study.");
      return;
    }
    setLensInstalled(true);
    removeItem("telescope-lens");
    completeQuest("observatory-missing-lens");
    discoverClue("observatory-lens-installed");
    showToast("The lens clicks into place. The sky sharpens immediately.");
  }

  function spinGlobe() {
    if (globeSpinning) return;
    setGlobeSpinning(true);
    setCountryFact(null);
    window.setTimeout(() => {
      setCountryFact(COUNTRY_FACTS[Math.floor(Math.random() * COUNTRY_FACTS.length)]);
      setGlobeSpinning(false);
    }, 950);
  }

  function inspectConstellation(constellation: Constellation) {
    setSelectedConstellation(constellation);
    setSelectedObject(null);
    setFoundConstellations((current) => {
      if (current.includes(constellation.id)) return current;
      const next = [...current, constellation.id];
      showToast(`${constellation.name} identified · ${next.length}/${CONSTELLATIONS.length}`);
      if (next.length === CONSTELLATIONS.length) discoverClue("observatory-constellation-solved");
      return next;
    });
  }

  function inspectSkyObject(object: SkyObject) {
    if (zoom + 0.001 < object.minZoom) {
      showToast(`Too small to identify. Increase zoom to at least ×${object.minZoom.toFixed(1)}.`);
      return;
    }
    setSelectedObject(object);
    setSelectedConstellation(null);
    setFoundObjects((current) => current.includes(object.id) ? current : [...current, object.id]);
    if (object.kind === "mystery") showToast("OBJECT NOT IN CATALOGUE · it moved.");
    else showToast(`${object.name} added to the celestial log.`);
  }

  function chooseConstellationNode(node: ConstellationNode) {
    if (constellationSolved) return;
    const next = [...selectedNodes, node];
    const correctSoFar = next.every((value, index) => value === CONSTELLATION_ORDER[index]);
    if (!correctSoFar) {
      setSelectedNodes([]);
      showToast("The brass pins reset. Wrong order.");
      return;
    }
    setSelectedNodes(next);
    if (next.length === CONSTELLATION_ORDER.length) {
      setConstellationSolved(true);
      setDrawerOpen(true);
      discoverClue("observatory-constellation-solved");
      completeQuest("observatory-star-wheel");
      showToast("The celestial drawer unlocks with three soft clicks.");
    }
  }

  function takeCoordinateCard() {
    if (hasCoordinateCard) return;
    addItem({
      id: "celestial-coordinate-card",
      name: "Celestial Coordinate Card",
      icon: "✦",
      description: "A small card marked 05h 35m · −05° 23′. The reverse says: 'when the room begins to dream'.",
      sourceRoom: "observatory",
      useIn: "dream",
    });
    discoverClue("observatory-coordinate-found");
    showToast("Celestial Coordinate Card added to your backpack.");
  }

  function setZoomClamped(next: number) {
    setZoom(clamp(next, 1, 2.6));
  }

  function handleScopePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;

    // Do not start a telescope drag when the player is clicking an
    // interactive constellation/object. Pointer capture here was stealing
    // the click from the SVG <g> elements.
    const target = event.target as SVGElement;
    if (target.closest?.(".sky-constellation, .sky-object")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCenterX: skyCenter.x,
      startCenterY: skyCenter.y,
    };
  }

  function handleScopePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dxWorld = ((event.clientX - drag.startX) / rect.width) * viewBox.width;
    const dyWorld = ((event.clientY - drag.startY) / rect.height) * viewBox.height;
    setSkyCenter({
      x: clamp(drag.startCenterX - dxWorld, viewBox.width / 2, SKY_WIDTH - viewBox.width / 2),
      y: clamp(drag.startCenterY - dyWorld, viewBox.height / 2, SKY_HEIGHT - viewBox.height / 2),
    });
  }

  function handleScopePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleScopeWheel(event: ReactWheelEvent<SVGSVGElement>) {
    event.preventDefault();
    setZoomClamped(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }

  function centerOn(target: SkyPoint, targetZoom = Math.max(zoom, 1.5)) {
    setSkyCenter(target);
    setZoomClamped(targetZoom);
  }

  const catMessages = [
    "The observatory cat opens one eye and decides you are not a comet.",
    "The cat relocates exactly twelve centimetres and resumes important research.",
    "A tiny paw covers the star atlas. Peer review has been cancelled.",
  ];

  return (
    <main className={`observatory-v3 ${lanternsOn ? "is-lit" : "is-dim"} ${projectorOn ? "projector-on" : ""} ${domeOpen ? "dome-open" : "dome-closed"}`}>
      <header className="obs3-header">
        <button type="button" onClick={returnToHub}>← hallway</button>
        <div><small>ROOM 04 · ABOVE THE WEATHER</small><h1>Observatory</h1><p>somebody has been charting things that do not belong to this sky</p></div>
        <div className="obs3-header-actions">
          <button type="button" onClick={() => setProjectorOn((v) => !v)}>{projectorOn ? "projector: on" : "project stars"}</button>
          <button type="button" onClick={() => setDomeOpen((v) => !v)}>{domeOpen ? "close dome" : "open dome"}</button>
        </div>
      </header>

      <section className="obs3-room">
        <div className={`obs3-dome ${domeOpen ? "is-open" : "is-closed"}`} aria-hidden="true">
          <div className="obs3-dome-sky">
            {Array.from({ length: 54 }, (_, i) => <i key={i} />)}
            <span className="obs3-dome-moon" />
            <button type="button" className="obs3-shooting-star" onClick={() => { setWishCount((v) => v + 1); showToast(`Wish recorded · ${wishCount + 1}`); }}>✦</button>
          </div>
          <div className="obs3-dome-ribs">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>
        </div>

        <aside className="obs3-left-zone">
          <section className="obs3-bookcase">
            <div className="obs3-shelf-books">
              {OBSERVATORY_BOOKS.slice(0,5).map((book) => (
                <button key={book.id} type="button" onClick={() => setBookOpen(book)} title={`Read ${book.subtitle}`}>{book.title}</button>
              ))}
            </div>
            <button type="button" className="obs3-star-atlas" onClick={() => setAtlasOpen(true)}><span className="mini-constellation">✦ ─ ✧ ─ ✦<br/>╲　╱　╲　╱</span><strong>STAR ATLAS</strong><small>{foundConstellations.length} patterns recognised · click to study</small></button>
          </section>
          <div className="obs3-ladder" aria-hidden="true"><i/><i/><i/><i/><i/></div>
          <div className="obs3-lounge">
            <button type="button" className="obs3-chair chair-a" onClick={() => showToast("A folded note says: 'Do not trust a sky that never moves.'")}><span /></button>
            <button type="button" className="obs3-chair chair-b" onClick={() => showToast("The blanket is still warm.")}><span /></button>
            <button type="button" className={`obs3-cat cat-${catMood % 3}`} onClick={() => { showToast(catMessages[catMood % catMessages.length]); setCatMood((v) => v + 1); }} aria-label="Pet the observatory cat"><span className="cat-ears"/><span className="cat-face">•ᴗ•</span><span className="cat-tail"/></button>
            <span className="obs3-plant">♧</span>
            <button type="button" className="obs3-tea" onClick={() => showToast("The tea has gone cold. Astronomically predictable.")}>☕</button>
          </div>
        </aside>

        <section className="obs3-center-zone" style={{ "--scope-x": `${(skyCenter.x - 110) / 110}`, "--scope-y": `${(skyCenter.y - 70) / 70}` } as CSSProperties}>
          <div className="obs3-telescope-wrap">
            <div className="obs3-telescope">
              <span className="scope-main-tube"/><span className="scope-rim"/><span className="scope-eyepiece"/><span className="scope-finder"/><span className="scope-band band-a"/><span className="scope-band band-b"/><span className="scope-focus-wheel"/>
            </div>
            <div className="obs3-mount"><span className="mount-gear gear-a"/><span className="mount-gear gear-b"/><span className="mount-hub"/><i/><i/><i/></div>
          </div>
          {!scopeReady ? (
            <button type="button" className="obs3-primary" onClick={installLens}>{ownsLens ? "install telescope lens" : "inspect empty lens mount"}</button>
          ) : (
            <button type="button" className="obs3-primary" disabled={!domeOpen} onClick={() => setScopeOpen(true)}>{domeOpen ? "look through telescope" : "open dome first"}</button>
          )}
          <p className="obs3-scope-status">{scopeReady ? "✓ optics calibrated · drag the sky · scroll or slide to zoom" : "42mm brass lens mount · currently empty"}</p>
        </section>

        <aside className="obs3-right-zone">
          <section className="obs3-orrery-shelf">
            <div className="obs3-shelf-books compact">
              {OBSERVATORY_BOOKS.slice(5).map((book) => (
                <button key={book.id} type="button" onClick={() => setBookOpen(book)} title={`Read ${book.subtitle}`}>{book.title}</button>
              ))}
            </div>
            <button type="button" className={`obs3-orrery ${orreryRunning ? "is-running" : ""}`} onClick={() => setOrreryRunning((v) => !v)} aria-label="Toggle the orrery"><span className="orrery-orbit"><i/><i/><i/></span><b>☉</b><small>{orreryRunning ? "orrery turning" : "orrery paused"}</small></button>
          </section>

          <section className="obs3-desk">
            <button type="button" className={`obs3-globe ${globeSpinning ? "is-spinning" : ""}`} onClick={spinGlobe}>
              <span className="globe-meridian"><span className="globe-ball"><i className="continent c1"/><i className="continent c2"/><i className="continent c3"/><i className="lat l1"/><i className="lat l2"/></span></span><span className="globe-axis"/><span className="globe-base"/><strong>WORLD GLOBE</strong><small>{globeSpinning ? "spinning…" : "click to spin"}</small>
            </button>
            <button type="button" className="obs3-journal" onClick={() => setJournalPage(0)}><strong>FIELD NOTES</strong><span>3 entries</span><small>open journal</small></button>
            <div className="obs3-moon-phase">
              <strong>MOON PHASE</strong>
              <MoonPhaseVisual phase={moonPhase} />
              <input
                aria-label="Moon phase"
                type="range"
                min="0"
                max="7"
                step="1"
                value={moonPhase}
                onInput={(e) => setMoonPhase(Number((e.target as HTMLInputElement).value))}
                onChange={(e) => setMoonPhase(Number(e.target.value))}
              />
              <small>{MOON_PHASES[moonPhase]}</small>
            </div>
          </section>

          <section className="obs3-celestial-lock">
            <div><strong>CELESTIAL LOCK</strong><p>journal order · three brass pins</p></div>
            <div className="obs3-lock-buttons">
              <button type="button" onClick={() => chooseConstellationNode("north")}><span>✦</span><strong>north</strong></button>
              <button type="button" onClick={() => chooseConstellationNode("crown")}><span>♕</span><strong>crown</strong></button>
              <button type="button" onClick={() => chooseConstellationNode("falling")}><span>☄</span><strong>falling</strong></button>
            </div>
            <div className={`obs3-secret-drawer ${drawerOpen ? "is-open" : ""}`}>
              {!drawerOpen ? <p>three brass pins keep this drawer shut</p> : <><strong>05h 35m · −05° 23′</strong><p>“when the room begins to dream”</p><button type="button" onClick={takeCoordinateCard} disabled={hasCoordinateCard}>{hasCoordinateCard ? "stored in backpack" : "take coordinate card"}</button></>}
            </div>
          </section>
        </aside>
      </section>

      {countryFact && (
        <aside className="obs3-country-card"><button type="button" onClick={() => setCountryFact(null)}>×</button><span>{countryFact.emoji}</span><small>THE GLOBE STOPPED AT</small><h2>{countryFact.country}</h2><strong>Capital · {countryFact.capital}</strong><p>{countryFact.fact}</p><div><b>NIGHT-SKY NOTE</b><p>{countryFact.skyFact}</p></div><button type="button" onClick={spinGlobe}>spin again</button></aside>
      )}

      {scopeOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setScopeOpen(false)}>
          <section className="obs3-scope-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="obs3-close" onClick={() => setScopeOpen(false)}>×</button>
            <div className="obs3-scope-toolbar">
              <div><small>BRASS TELESCOPE · LIVE SKY</small><strong>{coordinates}</strong></div>
              <div className="scope-help">drag to pan · wheel/slider to zoom · click discoveries</div>
            </div>
            <div className="obs3-scope-layout">
              <div className="obs3-eyepiece-shell">
                <svg
                  ref={svgRef}
                  className="obs3-sky-svg"
                  viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                  onPointerDown={handleScopePointerDown}
                  onPointerMove={handleScopePointerMove}
                  onPointerUp={handleScopePointerUp}
                  onPointerCancel={handleScopePointerUp}
                  onWheel={handleScopeWheel}
                  aria-label="Draggable telescope sky"
                >
                  <defs>
                    <radialGradient id="skyBg"><stop offset="0" stopColor="#15233d"/><stop offset="1" stopColor="#030713"/></radialGradient>
                    <filter id="starGlow"><feGaussianBlur stdDeviation="0.55" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  <rect x="0" y="0" width={SKY_WIDTH} height={SKY_HEIGHT} fill="url(#skyBg)" />
                  {Array.from({ length: 150 }, (_, i) => {
                    const x = (i * 47 + (i % 9) * 13) % SKY_WIDTH;
                    const y = (i * 31 + (i % 11) * 7) % SKY_HEIGHT;
                    const r = i % 13 === 0 ? .75 : i % 5 === 0 ? .45 : .24;
                    return <circle key={`field-${i}`} cx={x} cy={y} r={r} className="field-star" />;
                  })}

                  {CONSTELLATIONS.map((constellation) => {
                    const found = foundConstellations.includes(constellation.id);
                    return (
                      <g
                        key={constellation.id}
                        className={`sky-constellation ${found ? "is-found" : ""}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          inspectConstellation(constellation);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {found && constellation.lines.map(([a,b], index) => <line key={index} x1={constellation.stars[a].x} y1={constellation.stars[a].y} x2={constellation.stars[b].x} y2={constellation.stars[b].y} />)}
                        {constellation.stars.map((star,index) => <circle key={index} cx={star.x} cy={star.y} r={found ? .9 : .72} filter="url(#starGlow)" />)}
                        <circle className="constellation-hit" cx={constellation.anchor.x} cy={constellation.anchor.y} r="10" />
                        {found && <text x={constellation.anchor.x + 4} y={constellation.anchor.y - 5}>{constellation.name}</text>}
                      </g>
                    );
                  })}

                  {SKY_OBJECTS.map((object) => {
                    const found = foundObjects.includes(object.id);
                    const visibleEnough = zoom >= object.minZoom;
                    return (
                      <g
                      key={object.id}
                      className={`sky-object object-${object.kind} ${found ? "is-found" : ""} ${visibleEnough ? "is-resolvable" : ""}`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        inspectSkyObject(object);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                        {object.kind === "moon" && <><circle cx={object.x} cy={object.y} r="5.7"/><circle className="moon-shadow" cx={object.x + 2.2} cy={object.y - .2} r="5.6"/></>}
                        {object.kind === "galaxy" && <><ellipse cx={object.x} cy={object.y} rx="8.5" ry="2.5"/><ellipse className="galaxy-core" cx={object.x} cy={object.y} rx="3" ry=".9"/></>}
                        {object.kind === "cluster" && Array.from({ length: 8 },(_,i)=><circle key={i} cx={object.x + ((i*7)%9)-4} cy={object.y + ((i*11)%8)-4} r=".62"/>)}
                        {object.kind === "star" && <circle cx={object.x} cy={object.y} r="1.2" filter="url(#starGlow)"/>}
                        {object.kind === "mystery" && <circle cx={object.x} cy={object.y} r=".65" className="mystery-dot"/>}
                        <circle className="object-hit" cx={object.x} cy={object.y} r="7" />
                        {found && <text x={object.x + 3} y={object.y - 3}>{object.name}</text>}
                      </g>
                    );
                  })}
                </svg>
                <div className="obs3-crosshair" aria-hidden="true"><span/><i/></div>
                <div className="obs3-scope-readout"><strong>{coordinates}</strong><span>ZOOM ×{zoom.toFixed(2)}</span></div>
              </div>

              <aside className="obs3-scope-side">
                <div className="obs3-zoom-control"><label htmlFor="obsZoom">OPTICAL ZOOM · ×{zoom.toFixed(2)}</label><input id="obsZoom" type="range" min="1" max="2.6" step="0.05" value={zoom} onChange={(e) => setZoomClamped(Number(e.target.value))}/></div>
                <div className="obs3-scope-actions"><button type="button" onClick={() => centerOn({x:28,y:25},1.5)}>find moon</button><button type="button" onClick={() => centerOn({x:193,y:28},1.6)}>galaxy hint</button><button type="button" onClick={() => setCatalogOpen(true)}>celestial log</button></div>
                {selectedConstellation ? (
                  <article className="obs3-discovery-card"><small>CONSTELLATION IDENTIFIED</small><h2>{selectedConstellation.name}</h2><strong>{selectedConstellation.nickname}</strong><p>{selectedConstellation.fact}</p><span>{selectedConstellation.season}</span></article>
                ) : selectedObject ? (
                  <article className={`obs3-discovery-card ${selectedObject.kind === "mystery" ? "is-mystery" : ""}`}><small>{selectedObject.kind === "mystery" ? "CATALOGUE ERROR" : "CELESTIAL OBJECT"}</small><h2>{selectedObject.name}</h2><strong>{selectedObject.short}</strong><p>{selectedObject.detail}</p>{selectedObject.kind === "mystery" && <span>signal fragment: ···· · .-.. .-.. ---</span>}</article>
                ) : (
                  <article className="obs3-discovery-card"><small>CONSTELLATION HUNT</small><h2>{foundConstellations.length} / {CONSTELLATIONS.length}</h2><p>Move the telescope. Constellation lines only appear after you identify the pattern. Increase zoom to resolve named stars and smaller objects.</p><span>{foundObjects.length} celestial objects logged</span></article>
                )}
              </aside>
            </div>
          </section>
        </div>
      )}

      {journalPage !== null && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setJournalPage(null)}><section className="obs3-journal-modal" onMouseDown={(e) => e.stopPropagation()}><button type="button" className="obs3-close dark" onClick={() => setJournalPage(null)}>×</button><article><small>FIELD NOTES · {journalPage + 1}/3</small><h2>{JOURNAL_PAGES[journalPage].heading}</h2><p>{JOURNAL_PAGES[journalPage].body}</p></article><aside><strong>✦　♕　☄</strong><p>north · crown · falling</p><div><button type="button" disabled={journalPage === 0} onClick={() => setJournalPage((p) => Math.max(0,(p ?? 0)-1))}>← previous</button><button type="button" disabled={journalPage === 2} onClick={() => setJournalPage((p) => Math.min(2,(p ?? 0)+1))}>next →</button></div></aside></section></div>
      )}

      {atlasOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setAtlasOpen(false)}>
          <section className="obs3-atlas-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Star atlas">
            <button type="button" className="obs3-close" onClick={() => setAtlasOpen(false)}>×</button>
            <small>REFERENCE SHELF · FIELD GUIDE</small><h2>Star Atlas</h2><p>Six patterns have been marked in pencil. Study their shapes here, then find them by moving the telescope.</p>
            <div className="atlas-guide-grid">{CONSTELLATIONS.map((c) => (
              <article key={c.id} className={foundConstellations.includes(c.id) ? "found" : ""}><div className="atlas-pattern" aria-hidden="true">✦ · ✧ ─ ✦ ╲ ✦</div><strong>{c.name}</strong><span>{c.nickname}</span><p>{c.fact}</p><small>{foundConstellations.includes(c.id) ? "✓ identified through telescope" : `best seen in ${c.season}`}</small></article>
            ))}</div>
            <button type="button" className="obs3-atlas-open-scope" onClick={() => { setAtlasOpen(false); setScopeOpen(true); }}>open telescope and search</button>
          </section>
        </div>
      )}

      {bookOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setBookOpen(null)}>
          <section className="obs3-book-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={bookOpen.subtitle}>
            <button type="button" className="obs3-close dark" onClick={() => setBookOpen(null)}>×</button>
            <div className="book-cover"><small>OBSERVATORY REFERENCE</small><strong>{bookOpen.title}</strong><span>{bookOpen.subtitle}</span></div>
            <article><small>FROM THE SHELF</small><h2>{bookOpen.subtitle}</h2><p>{bookOpen.description}</p><div><b>MARGIN NOTE</b><p>{bookOpen.note}</p></div></article>
          </section>
        </div>
      )}

      {catalogOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setCatalogOpen(false)}><section className="obs3-catalog-modal" onMouseDown={(e) => e.stopPropagation()}><button type="button" className="obs3-close" onClick={() => setCatalogOpen(false)}>×</button><small>CELESTIAL LOG</small><h2>Things Found Above</h2><p>{foundConstellations.length} constellations · {foundObjects.length} objects</p><div className="catalog-grid">{CONSTELLATIONS.map((c)=><button key={c.id} type="button" className={foundConstellations.includes(c.id)?"found":""} onClick={()=>{setCatalogOpen(false);setScopeOpen(true);centerOn(c.anchor,1.65);}}><strong>{foundConstellations.includes(c.id)?c.name:"???"}</strong><span>{foundConstellations.includes(c.id)?c.nickname:"unidentified constellation"}</span></button>)}{SKY_OBJECTS.map((o)=><button key={o.id} type="button" className={foundObjects.includes(o.id)?"found":""} onClick={()=>{setCatalogOpen(false);setScopeOpen(true);centerOn({x:o.x,y:o.y},Math.max(o.minZoom,1.55));}}><strong>{foundObjects.includes(o.id)?o.name:"???"}</strong><span>{foundObjects.includes(o.id)?o.short:`requires zoom ×${o.minZoom.toFixed(1)}`}</span></button>)}</div></section></div>
      )}

      {toast && <div className="obs3-toast">{toast}</div>}
    </main>
  );
}

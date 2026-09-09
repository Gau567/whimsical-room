"use client";

import {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  WheelEvent as ReactWheelEvent,
  useEffect,
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

type CountryEntry = {
  country: string;
  emoji: string;
  capital: string;
  facts: string[];
  skyFacts: string[];
};

type OrreryPlanet = {
  id: string;
  name: string;
  symbol: string;
  orbit: number;
  speed: number;
  fact: string;
};

type RareEvent = {
  id: string;
  title: string;
  description: string;
  icon: string;
  effectLabel: string;
  logNote: string;
  reward?: string;
  focus: SkyPoint;
};

type RareLogEntry = {
  id: string;
  firstSeen: number;
  timesSeen: number;
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

const SKY_WIDTH = 360;
const SKY_HEIGHT = 220;
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
    anchor: { x: 63, y: 166 },
    stars: [{x:52,y:149},{x:73,y:146},{x:57,y:160},{x:63,y:161},{x:69,y:162},{x:53,y:184},{x:77,y:188}],
    lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
  },
  {
    id: "cassiopeia", name: "Cassiopeia", nickname: "The Queen", season: "northern autumn and winter",
    fact: "Five bright stars form Cassiopeia's unmistakable W or M shape.",
    anchor: { x: 292, y: 38 },
    stars: [{x:270,y:43},{x:280,y:31},{x:291,y:44},{x:304,y:28},{x:320,y:40}],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: "ursa-major", name: "Ursa Major", nickname: "The Great Bear", season: "circumpolar in many northern skies",
    fact: "The Big Dipper is part of Ursa Major. Its outer bowl stars point toward Polaris.",
    anchor: { x: 284, y: 116 },
    stars: [{x:250,y:112},{x:262,y:103},{x:276,y:108},{x:287,y:119},{x:300,y:113},{x:316,y:102},{x:332,y:110}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    id: "cygnus", name: "Cygnus", nickname: "The Swan", season: "northern summer",
    fact: "Cygnus forms the Northern Cross. Deneb is one corner of the Summer Triangle.",
    anchor: { x: 180, y: 48 },
    stars: [{x:180,y:20},{x:180,y:36},{x:180,y:51},{x:180,y:72},{x:159,y:50},{x:203,y:50}],
    lines: [[0,1],[1,2],[2,3],[4,2],[2,5]],
  },
  {
    id: "leo", name: "Leo", nickname: "The Lion", season: "northern spring",
    fact: "Leo's head forms a backward question-mark called the Sickle. Regulus sits near its base.",
    anchor: { x: 172, y: 171 },
    stars: [{x:147,y:166},{x:155,y:154},{x:168,y:157},{x:178,y:169},{x:170,y:182},{x:195,y:184},{x:215,y:173}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,6]],
  },
  {
    id: "scorpius", name: "Scorpius", nickname: "The Scorpion", season: "northern summer",
    fact: "Scorpius curves around reddish Antares, whose name means 'rival of Mars'.",
    anchor: { x: 313, y: 184 },
    stars: [{x:279,y:162},{x:291,y:170},{x:304,y:174},{x:317,y:179},{x:331,y:188},{x:344,y:200},{x:334,y:209},{x:321,y:205}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
  },
  {
    id: "lyra", name: "Lyra", nickname: "The Lyre", season: "northern summer",
    fact: "Lyra is a small constellation anchored by brilliant Vega, one of the brightest stars in the northern sky.",
    anchor: { x: 225, y: 92 },
    stars: [{x:218,y:77},{x:230,y:88},{x:222,y:102},{x:238,y:108},{x:245,y:95}],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,1]],
  },
  {
    id: "taurus", name: "Taurus", nickname: "The Bull", season: "northern winter",
    fact: "Taurus contains orange Aldebaran and lies near the Pleiades. Its face is traced by the V-shaped Hyades.",
    anchor: { x: 72, y: 70 },
    stars: [{x:55,y:64},{x:66,y:73},{x:79,y:67},{x:85,y:79},{x:98,y:73},{x:107,y:60}],
    lines: [[0,1],[1,2],[1,3],[3,4],[4,5]],
  },
  {
    id: "gemini", name: "Gemini", nickname: "The Twins", season: "northern winter",
    fact: "Gemini is marked by the bright twin stars Castor and Pollux, with two long chains of stars forming the twins' bodies.",
    anchor: { x: 118, y: 29 },
    stars: [{x:105,y:18},{x:122,y:17},{x:110,y:31},{x:126,y:34},{x:113,y:49},{x:130,y:52}],
    lines: [[0,2],[2,4],[1,3],[3,5],[2,3]],
  },
  {
    id: "pegasus", name: "Pegasus", nickname: "The Winged Horse", season: "northern autumn",
    fact: "Pegasus is easy to begin with the Great Square: four bright stars forming a huge tilted box.",
    anchor: { x: 286, y: 76 },
    stars: [{x:266,y:62},{x:292,y:59},{x:296,y:87},{x:269,y:91},{x:317,y:73}],
    lines: [[0,1],[1,2],[2,3],[3,0],[1,4]],
  },
];
const SKY_OBJECTS: SkyObject[] = [
  { id: "moon", name: "The Moon", kind: "moon", x: 42, y: 34, minZoom: 1, short: "Earth's natural satellite", detail: "The dark plains are lunar maria: enormous ancient lava flows visible from Earth." },
  { id: "andromeda", name: "Andromeda Galaxy", kind: "galaxy", x: 326, y: 48, minZoom: 1.15, short: "M31 · neighboring spiral galaxy", detail: "Andromeda is the nearest large galaxy to the Milky Way and appears as a soft elongated glow under dark skies." },
  { id: "pleiades", name: "Pleiades", kind: "cluster", x: 48, y: 108, minZoom: 1.35, short: "M45 · open star cluster", detail: "The Pleiades are a young nearby cluster in Taurus. Several bright blue-white members are visible to the naked eye." },
  { id: "polaris", name: "Polaris", kind: "star", x: 188, y: 10, minZoom: 1.7, short: "The North Star", detail: "Polaris lies close to the north celestial pole, so the northern sky appears to rotate around it." },
  { id: "betelgeuse", name: "Betelgeuse", kind: "star", x: 52, y: 149, minZoom: 1.8, short: "Red supergiant in Orion", detail: "Betelgeuse is a huge evolved star whose warm colour is noticeably different from many nearby blue-white stars." },
  { id: "rigel", name: "Rigel", kind: "star", x: 77, y: 188, minZoom: 1.8, short: "Blue supergiant in Orion", detail: "Rigel is one of Orion's brightest stars and marks the Hunter's foot." },
  { id: "unknown", name: "Uncatalogued Object", kind: "mystery", x: 345, y: 208, minZoom: 2.25, short: "OBJECT NOT IN CATALOGUE", detail: "It shifts slightly between observations. The journal contains no matching entry." },
  { id: "saturn", name: "Saturn", kind: "cluster", x: 236, y: 28, minZoom: 1.55, short: "Ringed gas giant", detail: "Saturn's rings are made mostly of countless icy particles. Even a modest telescope can reveal the planet's unmistakable flattened ring system." },
  { id: "jupiter", name: "Jupiter", kind: "moon", x: 318, y: 138, minZoom: 1.4, short: "Largest planet in the Solar System", detail: "Jupiter's cloud bands and four bright Galilean moons make it one of the most rewarding telescope targets." },
  { id: "mars", name: "Mars", kind: "star", x: 20, y: 132, minZoom: 1.35, short: "The Red Planet", detail: "Mars appears warm orange-red because iron minerals in its surface dust have oxidised." },
  { id: "orion-nebula", name: "Orion Nebula", kind: "galaxy", x: 63, y: 170, minZoom: 1.75, short: "M42 · stellar nursery", detail: "The Orion Nebula is a vast cloud of glowing gas where new stars are forming, visible as a fuzzy patch beneath Orion's Belt." },
  { id: "double-cluster", name: "Double Cluster", kind: "cluster", x: 242, y: 118, minZoom: 1.65, short: "NGC 869 + NGC 884", detail: "Two neighbouring open clusters in Perseus form a spectacular double spray of young stars." },
];

const OBSERVATORY_BOOKS: BookInfo[] = [
  { id: "between", title: "BETWEEN", subtitle: "The Rooms Between", description: "A plain brown volume with no author and no catalogue number. Most pages look empty until the observatory lights dim.", note: "The ink does not stay in the same place twice." },
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

const COUNTRY_DATABASE: CountryEntry[] = [
  { country: "Singapore", emoji: "🇸🇬", capital: "Singapore", facts: ["Singapore is one of the world's few sovereign city-states.", "The island sits only a little over one degree north of the Equator.", "Its four official languages are English, Malay, Mandarin and Tamil."], skyFacts: ["Near-equatorial observers can see stars from both celestial hemispheres.", "The Southern Cross can be seen from Singapore at suitable times of year."] },
  { country: "India", emoji: "🇮🇳", capital: "New Delhi", facts: ["India spans tropical coasts, deserts, high plateaus and the Himalayas.", "Jantar Mantar observatories used enormous masonry instruments for naked-eye measurements.", "India is home to one of the world's oldest continuous astronomical traditions."], skyFacts: ["Seasonal Indian skies can show Orion, Scorpius and brilliant Milky Way fields.", "Historical Indian astronomy developed sophisticated calendars and planetary models."] },
  { country: "Japan", emoji: "🇯🇵", capital: "Tokyo", facts: ["Japan is an archipelago of thousands of islands.", "Its islands stretch from cool northern latitudes into the subtropics.", "Mountains cover most of Japan's land area."], skyFacts: ["Japanese observers kept centuries of records of comets and guest stars.", "Subaru, the Japanese name for the Pleiades, literally refers to gathering together."] },
  { country: "Chile", emoji: "🇨🇱", capital: "Santiago", facts: ["Chile is extraordinarily long and narrow, running along South America's Pacific coast.", "The Atacama Desert is among the driest places on Earth.", "Chile stretches from subtropical desert to subantarctic landscapes."], skyFacts: ["The Atacama hosts ALMA and several major international observatories.", "Dry, high-altitude air makes northern Chile one of Earth's premier astronomy regions."] },
  { country: "Norway", emoji: "🇳🇴", capital: "Oslo", facts: ["Norway's coastline is carved by thousands of fjords and islands.", "The country extends far north of the Arctic Circle.", "Some northern communities experience weeks without sunset in summer."], skyFacts: ["Northern Norway lies beneath the auroral oval.", "Winter darkness creates long observing windows for aurora and circumpolar stars."] },
  { country: "Australia", emoji: "🇦🇺", capital: "Canberra", facts: ["Australia is both a country and a continent.", "Its interior contains vast arid and semi-arid regions.", "Most Australians live relatively close to the coast."], skyFacts: ["Australian skies reveal the Southern Cross and Magellanic Clouds.", "The radio telescope at Parkes played an important role in space exploration and astronomy."] },
  { country: "New Zealand", emoji: "🇳🇿", capital: "Wellington", facts: ["New Zealand consists mainly of two large islands and many smaller ones.", "Its landscapes were heavily shaped by tectonic and volcanic activity.", "The country is one of the first places to see a new day."], skyFacts: ["Aoraki Mackenzie is an internationally recognised dark-sky reserve.", "The Magellanic Clouds are prominent naked-eye objects from New Zealand."] },
  { country: "South Africa", emoji: "🇿🇦", capital: "Pretoria", facts: ["South Africa has coastlines on both the Atlantic and Indian Oceans.", "Its interior includes high plateaus and the Karoo semi-desert.", "The country recognises multiple capital cities for different branches of government."], skyFacts: ["Sutherland hosts the Southern African Large Telescope.", "The Karoo's dry dark skies are also important for radio astronomy."] },
  { country: "Egypt", emoji: "🇪🇬", capital: "Cairo", facts: ["Most of Egypt's population lives close to the Nile River.", "Ancient Egyptian calendars closely tracked seasonal cycles.", "The Sahara covers most of the country."], skyFacts: ["Sirius had major historical importance in Egyptian timekeeping.", "Ancient monuments frequently show careful orientation to cardinal directions and celestial cycles."] },
  { country: "Greece", emoji: "🇬🇷", capital: "Athens", facts: ["Greece includes thousands of islands scattered through the Aegean and Ionian seas.", "Ancient Greek scholars developed influential geometric models of the cosmos.", "Many modern scientific terms preserve Greek roots."], skyFacts: ["A huge number of constellation names come through Greek mythology.", "Orion, Andromeda, Cassiopeia and Pegasus all carry Greek mythological stories."] },
  { country: "United Kingdom", emoji: "🇬🇧", capital: "London", facts: ["The United Kingdom consists of England, Scotland, Wales and Northern Ireland.", "Its maritime history made precise navigation and timekeeping especially important.", "The Greenwich meridian passes through southeast London."], skyFacts: ["Greenwich became the reference point for longitude and global timekeeping.", "The Royal Observatory's history links astronomy directly to navigation at sea."] },
  { country: "Canada", emoji: "🇨🇦", capital: "Ottawa", facts: ["Canada has the world's longest coastline.", "Much of northern Canada lies within the Arctic.", "The country spans six primary time zones."], skyFacts: ["Northern Canada has excellent auroral activity.", "Circumpolar constellations can remain visible all night from high northern latitudes."] },
  { country: "Brazil", emoji: "🇧🇷", capital: "Brasília", facts: ["Brazil is the largest country in South America.", "The Equator crosses northern Brazil.", "The Amazon basin contains the world's largest tropical rainforest."], skyFacts: ["Southern celestial objects are much easier to observe from most of Brazil than from Europe.", "Near-equatorial regions can access substantial portions of both celestial hemispheres."] },
  { country: "Mexico", emoji: "🇲🇽", capital: "Mexico City", facts: ["Mexico sits where several major tectonic plates interact.", "The country contains deserts, high plateaus, volcanoes and tropical forests.", "Mexico City lies at high elevation."], skyFacts: ["High-altitude sites can offer clearer astronomical seeing than humid lowlands.", "Mexico's latitude gives access to both northern constellations and objects nearer the southern sky."] },
  { country: "Peru", emoji: "🇵🇪", capital: "Lima", facts: ["Peru contains Pacific desert, the Andes and Amazon rainforest.", "The Andes rise dramatically through the centre of the country.", "Ancient Andean cultures developed sophisticated landscape and sky traditions."], skyFacts: ["Andean astronomy includes dark-cloud constellations traced through the Milky Way.", "High mountain skies can be extraordinarily transparent when conditions are dry."] },
  { country: "Argentina", emoji: "🇦🇷", capital: "Buenos Aires", facts: ["Argentina stretches from subtropical north to subantarctic Patagonia.", "The Andes form much of its western border.", "Patagonia has some of South America's widest open landscapes."], skyFacts: ["Southern Argentina offers dramatic views of the Milky Way's southern regions.", "Objects around the south celestial pole remain visible for long periods."] },
  { country: "Kenya", emoji: "🇰🇪", capital: "Nairobi", facts: ["The Equator crosses Kenya.", "Kenya contains highlands, savannahs and part of the Great Rift Valley.", "Mount Kenya is the country's highest mountain."], skyFacts: ["From the Equator both celestial poles sit close to opposite horizons.", "Observers can see a remarkable mix of northern and southern constellations."] },
  { country: "Indonesia", emoji: "🇮🇩", capital: "Jakarta", facts: ["Indonesia is the world's largest archipelagic state.", "It spans thousands of islands across the Equator.", "Its geology is shaped by the Pacific Ring of Fire."], skyFacts: ["Equatorial skies provide broad access to both celestial hemispheres.", "Dark island locations can offer spectacular Milky Way views away from city lights."] },
  { country: "South Korea", emoji: "🇰🇷", capital: "Seoul", facts: ["South Korea occupies the southern part of the Korean Peninsula.", "Much of its landscape is mountainous.", "Cheomseongdae in Gyeongju dates to the seventh century."], skyFacts: ["Historical Korean records contain detailed observations of comets and guest stars.", "Cheomseongdae is among East Asia's oldest surviving astronomical structures."] },
  { country: "Morocco", emoji: "🇲🇦", capital: "Rabat", facts: ["Morocco includes Atlantic coast, Mediterranean coast, mountains and Saharan landscapes.", "The Atlas Mountains cross much of the country.", "Its cities preserve layers of Amazigh, Arab, African and European history."], skyFacts: ["Dry desert regions can produce excellent dark-sky conditions.", "Broad Saharan horizons make zodiacal light and bright planets especially striking."] },
  { country: "United Arab Emirates", emoji: "🇦🇪", capital: "Abu Dhabi", facts: ["The UAE consists of seven emirates.", "Its landscape combines modern coastal cities with large desert regions.", "Much of the country has a hot arid climate."], skyFacts: ["Desert sites away from cities offer clear views of winter constellations.", "The Emirates Mars Mission made the UAE one of the newest nations operating an interplanetary spacecraft."] },
  { country: "Spain", emoji: "🇪🇸", capital: "Madrid", facts: ["Spain occupies most of the Iberian Peninsula.", "The Canary Islands lie far southwest of mainland Spain in the Atlantic.", "The country contains several distinct climate regions."], skyFacts: ["La Palma and Tenerife host major observatories above much of the cloud layer.", "The Canary Islands' stable atmosphere makes them prized astronomy locations."] },
  { country: "Italy", emoji: "🇮🇹", capital: "Rome", facts: ["Italy extends into the Mediterranean Sea as a long peninsula.", "The Alps form much of its northern boundary.", "Italy has several active volcanoes."], skyFacts: ["Galileo's telescopic observations transformed understanding of the Moon and planets.", "Italy has a long history of observatories and astronomical instrument making."] },
  { country: "France", emoji: "🇫🇷", capital: "Paris", facts: ["France spans landscapes from Atlantic coasts to the Alps and Mediterranean.", "It also includes overseas territories across several oceans.", "The metric system was developed during the French Revolution."], skyFacts: ["Paris Observatory was founded in the seventeenth century.", "French astronomers contributed extensively to mapping planets, stars and the shape of Earth."] },
  { country: "United States", emoji: "🇺🇸", capital: "Washington, D.C.", facts: ["The United States spans arctic, tropical, desert, mountain and temperate environments.", "Alaska and Hawaii greatly extend its geographic range.", "The country has several large protected dark-sky regions."], skyFacts: ["Mauna Kea, Arizona and New Mexico host major optical observatories.", "The Very Large Array in New Mexico uses 27 radio antennas as one giant instrument."] },
  { country: "Thailand", emoji: "🇹🇭", capital: "Bangkok", facts: ["Thailand stretches from northern mountains to a long tropical peninsula.", "The Chao Phraya plain is one of the country's major agricultural regions.", "Bangkok grew around a network of waterways."], skyFacts: ["Its latitude allows Orion, Scorpius and many southern objects to rise high in the sky.", "Dry-season observing can offer excellent views away from urban light pollution."] },
  { country: "Philippines", emoji: "🇵🇭", capital: "Manila", facts: ["The Philippines is an archipelago of more than seven thousand islands.", "It lies along the Pacific Ring of Fire.", "Its climate is strongly influenced by surrounding tropical seas."], skyFacts: ["The Southern Cross can be observed from the Philippines.", "Orion and Scorpius are prominent seasonal constellations in Philippine skies."] },
];

const ORRERY_PLANETS: OrreryPlanet[] = [
  { id: "mercury", name: "Mercury", symbol: "☿", orbit: 15, speed: 4.1, fact: "The closest planet to the Sun and the fastest around it." },
  { id: "venus", name: "Venus", symbol: "♀", orbit: 23, speed: 1.6, fact: "A cloud-covered world with a runaway greenhouse atmosphere." },
  { id: "earth", name: "Earth", symbol: "⊕", orbit: 31, speed: 1, fact: "Our home world, with one large natural satellite." },
  { id: "mars", name: "Mars", symbol: "♂", orbit: 39, speed: .53, fact: "A cold desert world with giant volcanoes and canyons." },
  { id: "jupiter", name: "Jupiter", symbol: "♃", orbit: 50, speed: .084, fact: "The largest planet, wrapped in turbulent cloud bands." },
  { id: "saturn", name: "Saturn", symbol: "♄", orbit: 60, speed: .034, fact: "A gas giant surrounded by an immense system of icy rings." },
];

const RARE_EVENTS: RareEvent[] = [
  {
    id: "meteor",
    title: "Meteor Crossing",
    description: "A bright meteor tears through the eyepiece and vanishes before the catalogue can assign a number.",
    icon: "☄",
    effectLabel: "Wish captured",
    logNote: "The meteor crossed east-to-west in under two seconds. A thin amber trace remains on the observation glass.",
    focus: { x: 248, y: 58 },
  },
  {
    id: "satellite",
    title: "Satellite Transit",
    description: "A tiny artificial point glides steadily through the field. Too straight, too patient to be a star.",
    icon: "◇",
    effectLabel: "Orbital track pinned",
    logNote: "The pass repeats close to 11:47. Someone has underlined the time twice in the margin.",
    focus: { x: 112, y: 72 },
  },
  {
    id: "comet",
    title: "Unexpected Comet",
    description: "A diffuse visitor with a pale tail drifts into view. Someone has pencilled a question mark beside today's date.",
    icon: "✧",
    effectLabel: "Comet ephemeris unlocked",
    logNote: "Its tail points away from the Sun. The calculated path does not match anything in the shelf catalogue.",
    focus: { x: 306, y: 138 },
  },
  {
    id: "window",
    title: "A Window Where No Room Should Be",
    description: "For three seconds, the telescope frames a lit window suspended among the stars. Something moves behind the curtain.",
    icon: "▣",
    effectLabel: "Impossible window sketched",
    logNote: "The frame has seven panes. None of the observatory's architectural drawings contain a window like it.",
    reward: "dream-route",
    focus: { x: 334, y: 38 },
  },
];

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
  const [skyCenter, setSkyCenter] = useState({ x: 180, y: 110 });
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
  const [secretBookOpen, setSecretBookOpen] = useState(false);
  const [secretBookAwake, setSecretBookAwake] = useState(false);
  const [secretBookPage, setSecretBookPage] = useState(0);
  const [projectorPanelOpen, setProjectorPanelOpen] = useState(false);
  const [projectorMode, setProjectorMode] = useState<"constellations" | "solar" | "rooms">("constellations");
  const [orreryOpen, setOrreryOpen] = useState(false);
  const [orreryAngles, setOrreryAngles] = useState<Record<string, number>>(() => Object.fromEntries(ORRERY_PLANETS.map((p, i) => [p.id, i * 42])));
  const [selectedPlanet, setSelectedPlanet] = useState<OrreryPlanet>(ORRERY_PLANETS[2]);
  const [moonLogOpen, setMoonLogOpen] = useState(false);
  const [loggedMoonPhases, setLoggedMoonPhases] = useState<number[]>([]);
  const [ladderOpen, setLadderOpen] = useState(false);
  const [ladderVisited, setLadderVisited] = useState(false);
  const [rareEvent, setRareEvent] = useState<RareEvent | null>(null);
  const [rareLog, setRareLog] = useState<RareLogEntry[]>([]);
  const [selectedRareId, setSelectedRareId] = useState<string | null>(null);
  const [scopeMoves, setScopeMoves] = useState(0);
  const [globeHistory, setGlobeHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("observatory-v10-rare-log");
      if (!raw) return;
      const parsed = JSON.parse(raw) as RareLogEntry[];
      if (Array.isArray(parsed)) setRareLog(parsed);
    } catch {
      // A damaged local log should never stop the room from loading.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("observatory-v10-rare-log", JSON.stringify(rareLog));
    } catch {
      // localStorage may be unavailable in strict/private browser modes.
    }
  }, [rareLog]);

  const loggedRareEvents = useMemo(() => rareLog.map((entry) => entry.id), [rareLog]);
  const rareResearchScore = rareLog.reduce((sum, entry) => sum + entry.timesSeen, 0);

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
      const available = COUNTRY_DATABASE.filter((entry) => !globeHistory.slice(-5).includes(entry.country));
      const pool = available.length ? available : COUNTRY_DATABASE;
      const entry = pool[Math.floor(Math.random() * pool.length)];
      const fact = entry.facts[Math.floor(Math.random() * entry.facts.length)];
      const skyFact = entry.skyFacts[Math.floor(Math.random() * entry.skyFacts.length)];
      setCountryFact({ country: entry.country, emoji: entry.emoji, capital: entry.capital, fact, skyFact });
      setGlobeHistory((history) => [...history.slice(-11), entry.country]);
      setGlobeSpinning(false);
    }, 950);
  }

  function maybeTriggerRareEvent() {
    if (rareEvent || scopeMoves < 4) return;

    const unseen = RARE_EVENTS.filter((event) => !loggedRareEvents.includes(event.id));
    const pool = unseen.length ? unseen : RARE_EVENTS;

    // Gentle pity system: rare events become more likely the longer the player explores.
    const chance = scopeMoves >= 12 ? 1 : Math.min(0.18 + (scopeMoves - 4) * 0.055, 0.72);
    if (Math.random() > chance) return;

    const event = pool[Math.floor(Math.random() * pool.length)];
    setRareEvent(event);
    showToast(`RARE SIGHTING · ${event.title}`);
  }

  function logRareEvent(event: RareEvent) {
    setRareLog((current) => {
      const existing = current.find((entry) => entry.id === event.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === event.id ? { ...entry, timesSeen: entry.timesSeen + 1 } : entry
        );
      }
      return [...current, { id: event.id, firstSeen: Date.now(), timesSeen: 1 }];
    });

    if (event.id === "meteor") {
      setWishCount((value) => value + 1);
    }

    if (event.id === "satellite") {
      showToast("Satellite transit logged · 11:47 marked for comparison.");
    }

    if (event.id === "comet") {
      showToast("Comet ephemeris added to the celestial log.");
    }

    if (event.id === "window") {
      discoverClue("observatory-coordinate-found");
      if (!hasItem("impossible-window-sketch")) {
        addItem({
          id: "impossible-window-sketch",
          name: "Sketch of an Impossible Window",
          icon: "▣",
          description: "Seven panes copied from a window seen through the Observatory telescope. The reverse reads: 'find the room that dreams'.",
          sourceRoom: "observatory",
          useIn: "dream",
        });
      }
    }

    setSelectedRareId(event.id);
    setRareEvent(null);
  }

  function advanceOrrery(days = 30) {
    setOrreryAngles((current) => {
      const next = { ...current };
      for (const planet of ORRERY_PLANETS) next[planet.id] = (next[planet.id] + days * planet.speed) % 360;
      return next;
    });
  }

  function setPlanetAngle(id: string, value: number) {
    setOrreryAngles((current) => ({ ...current, [id]: value }));
  }

  function logMoonPhase() {
    setLoggedMoonPhases((current) => current.includes(moonPhase) ? current : [...current, moonPhase]);
    showToast(`${MOON_PHASES[moonPhase]} logged in the lunar notebook.`);
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
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setScopeMoves((moves) => moves + 1);
      window.setTimeout(maybeTriggerRareEvent, 0);
    }
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
    <main className={`observatory-v3 ${lanternsOn ? "is-lit" : "is-dim"} ${projectorOn ? `projector-on projector-${projectorMode}` : ""} ${domeOpen ? "dome-open" : "dome-closed"}`}>
      <header className="obs3-header">
        <button type="button" onClick={returnToHub}>← hallway</button>
        <div><small>ROOM 04 · ABOVE THE WEATHER</small><h1>Observatory</h1><p>somebody has been charting things that do not belong to this sky</p></div>
        <div className="obs3-header-actions">
          <button type="button" onClick={() => setProjectorPanelOpen(true)}>{projectorOn ? "projector: on" : "constellation projector"}</button>
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
                <button key={book.id} type="button" onClick={() => { if (book.id === "between") { setSecretBookOpen(true); window.setTimeout(() => setSecretBookAwake(true), 420); } else setBookOpen(book); }} title={`Read ${book.subtitle}`}>{book.title}</button>
              ))}
            </div>
            <button type="button" className="obs3-star-atlas" onClick={() => setAtlasOpen(true)}><span className="mini-constellation">✦ ─ ✧ ─ ✦<br/>╲　╱　╲　╱</span><strong>STAR ATLAS</strong><small>{foundConstellations.length} patterns recognised · click to study</small></button>
          </section>
          <button type="button" className="obs3-ladder" onClick={() => { setLadderOpen(true); setLadderVisited(true); }} aria-label="Climb the observatory ladder"><i/><i/><i/><i/><i/><span>climb</span></button>
          <div className="obs3-lounge">
            <button type="button" className="obs3-chair chair-a" onClick={() => showToast("A folded note says: 'Do not trust a sky that never moves.'")}><span /></button>
            <button type="button" className="obs3-chair chair-b" onClick={() => showToast("The blanket is still warm.")}><span /></button>
            <button type="button" className={`obs3-cat cat-${catMood % 3}`} onClick={() => {
              const nextMood = catMood + 1;
              if (ladderVisited && nextMood >= 5) showToast("The cat knocks a brass star token from behind the cushion. It was apparently conducting independent research.");
              else showToast(catMessages[catMood % catMessages.length]);
              setCatMood(nextMood);
            }} aria-label="Pet the observatory cat"><span className="cat-ears"/><span className="cat-face">•ᴗ•</span><span className="cat-tail"/></button>
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
            <button type="button" className={`obs3-orrery ${orreryRunning ? "is-running" : ""}`} onClick={() => setOrreryOpen(true)} aria-label="Open interactive orrery"><span className="orrery-orbit"><i/><i/><i/></span><b>☉</b><small>{orreryRunning ? "orrery turning" : "orrery paused"}</small></button>
          </section>

          <section className="obs3-desk">
            <button type="button" className={`obs3-globe ${globeSpinning ? "is-spinning" : ""}`} onClick={spinGlobe}>
              <span className="globe-meridian"><span className="globe-ball"><i className="continent c1"/><i className="continent c2"/><i className="continent c3"/><i className="lat l1"/><i className="lat l2"/></span></span><span className="globe-axis"/><span className="globe-base"/><strong>WORLD GLOBE</strong><small>{globeSpinning ? "spinning…" : "click to spin"}</small>
            </button>
            <button type="button" className="obs3-journal" onClick={() => setJournalPage(0)}><strong>FIELD NOTES</strong><span>3 entries</span><small>open journal</small></button>
            <div className="obs3-moon-phase">
              <strong>MOON PHASE</strong>
              <button type="button" className="obs3-moon-open" onClick={() => setMoonLogOpen(true)} aria-label="Open lunar observation notebook"><MoonPhaseVisual phase={moonPhase} /></button>
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
              <button type="button" className="obs3-log-moon" onClick={logMoonPhase}>log phase</button>
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
                  {Array.from({ length: 260 }, (_, i) => {
                    const x = (i * 47 + (i % 9) * 13) % SKY_WIDTH;
                    const y = (i * 31 + (i % 11) * 7) % SKY_HEIGHT;
                    const r = i % 29 === 0 ? .95 : i % 13 === 0 ? .62 : i % 5 === 0 ? .38 : .19;
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
                        {constellation.stars.map((star,index) => (
                          <g key={index} className="constellation-star-target">
                            <circle cx={star.x} cy={star.y} r={found ? .9 : .58} filter="url(#starGlow)" />
                            <circle className="constellation-star-hit" cx={star.x} cy={star.y} r="3.2" />
                          </g>
                        ))}
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
                  {rareEvent && (
                    <g className={`rare-sky-event rare-${rareEvent.id}`} onPointerDown={(e) => { e.stopPropagation(); showToast(`${rareEvent.icon} ${rareEvent.title}`); }}>
                      {rareEvent.id === "meteor" && <>
                        <path d={`M ${skyCenter.x-12} ${skyCenter.y+7} L ${skyCenter.x+10} ${skyCenter.y-8}`} />
                        <circle cx={skyCenter.x+10} cy={skyCenter.y-8} r="1.8"/>
                      </>}
                      {rareEvent.id === "satellite" && <>
                        <path className="rare-track" d={`M ${skyCenter.x-16} ${skyCenter.y-3} L ${skyCenter.x+16} ${skyCenter.y+5}`} />
                        <circle cx={skyCenter.x+3} cy={skyCenter.y+1} r="1.4"/>
                      </>}
                      {rareEvent.id === "comet" && <>
                        <ellipse cx={skyCenter.x+4} cy={skyCenter.y-4} rx="2.2" ry="1.4"/>
                        <path d={`M ${skyCenter.x-14} ${skyCenter.y+2} Q ${skyCenter.x-4} ${skyCenter.y-1} ${skyCenter.x+4} ${skyCenter.y-4}`} />
                      </>}
                      {rareEvent.id === "window" && <>
                        <rect className="rare-window-frame" x={skyCenter.x-5} y={skyCenter.y-6} width="10" height="8" rx=".6"/>
                        <path className="rare-window-cross" d={`M ${skyCenter.x} ${skyCenter.y-6} V ${skyCenter.y+2} M ${skyCenter.x-5} ${skyCenter.y-2} H ${skyCenter.x+5}`} />
                      </>}
                      <text x={skyCenter.x+11} y={skyCenter.y-10}>{rareEvent.icon}</text>
                    </g>
                  )}
                </svg>
                <div className="obs3-crosshair" aria-hidden="true"><span/><i/></div>
                <div className="obs3-scope-readout"><strong>{coordinates}</strong><span>ZOOM ×{zoom.toFixed(2)}</span></div>
              </div>

              <aside className="obs3-scope-side">
                <div className="obs3-zoom-control"><label htmlFor="obsZoom">OPTICAL ZOOM · ×{zoom.toFixed(2)}</label><input id="obsZoom" type="range" min="1" max="2.6" step="0.05" value={zoom} onChange={(e) => setZoomClamped(Number(e.target.value))}/></div>
                <div className="obs3-scope-actions"><button type="button" onClick={() => centerOn({x:28,y:25},1.5)}>find moon</button><button type="button" onClick={() => centerOn({x:193,y:28},1.6)}>galaxy hint</button><button type="button" onClick={() => setCatalogOpen(true)}>celestial log</button></div>
                {rareEvent && <article className="obs3-rare-card"><small>RARE TELESCOPE EVENT</small><h2><span>{rareEvent.icon}</span> {rareEvent.title}</h2><p>{rareEvent.description}</p><div className="rare-effect-preview"><b>LOG EFFECT</b><span>{rareEvent.effectLabel}</span></div><button type="button" onClick={() => logRareEvent(rareEvent)}>record sighting</button></article>}
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

      {secretBookOpen && (
        <div className="obs3-modal-backdrop magical" onMouseDown={() => { setSecretBookOpen(false); setSecretBookAwake(false); }}>
          <section className={`obs3-secret-book ${secretBookAwake ? "is-awake" : ""}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="The Rooms Between">
            <button type="button" className="obs3-close dark" onClick={() => { setSecretBookOpen(false); setSecretBookAwake(false); }}>×</button>
            <div className="secret-book-page left-page">
              <small>PROPERTY OF NO ONE</small>
              <h2>{secretBookAwake ? "The Rooms Between" : "Building Register"}</h2>
              {!secretBookAwake ? <p>The page appears blank except for a faded floor plan and several impossible corrections.</p> : <>
                <div className="arcane-wheel"><span/><i/><b>✦</b></div>
                <p className="flicker-copy">The ink wakes when starlight touches it. Corridors redraw themselves around the rooms you have already entered.</p>
                <button type="button" onClick={() => setSecretBookPage((p) => (p + 1) % 4)}>turn impossible page →</button>
              </>}
            </div>
            <div className="secret-book-page right-page">
              {!secretBookAwake ? <div className="sleeping-map">···</div> : <>
                <div className="secret-room-map">
                  {["NOSTALGIA","MIDNIGHT STUDY","OBSERVATORY","ARCADE","DREAM ROOM","TRAIN","GREENHOUSE"].map((room, i) => <span key={room} className={i <= secretBookPage + 2 ? "revealed" : "redacted"}>{i <= secretBookPage + 2 ? room : "████████"}</span>)}
                </div>
                <article className="building-secret">
                  <small>PAGE {secretBookPage + 1}</small>
                  <p>{[
                    "The hallway is not a corridor. It is a memory of one.",
                    "One room appears only when observed from somewhere that should not have a window.",
                    "The train stops at a platform that does not exist on any timetable.",
                    "When every fragment is returned, the building remembers its final door."
                  ][secretBookPage]}</p>
                </article>
                {loggedRareEvents.length > 0 && <aside className="rare-book-addendum"><small>INK ADDED ITSELF</small><p>{loggedRareEvents.includes("window") ? "A seventh window has appeared in the building plan. It opens onto a room labelled only: DREAM." : `The book has copied ${loggedRareEvents.length} unusual sky ${loggedRareEvents.length === 1 ? "sighting" : "sightings"} into its margins.`}</p></aside>}
              </>}
            </div>
          </section>
        </div>
      )}

      {projectorPanelOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setProjectorPanelOpen(false)}>
          <section className="obs3-projector-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="obs3-close" onClick={() => setProjectorPanelOpen(false)}>×</button>
            <small>BRASS CONSTELLATION PROJECTOR</small><h2>Paint the dome with light</h2>
            <div className="projector-modes">
              {(["constellations","solar","rooms"] as const).map((mode) => <button key={mode} className={projectorMode===mode?"active":""} onClick={()=>setProjectorMode(mode)}>{mode}</button>)}
            </div>
            <div className={`projector-preview mode-${projectorMode}`}>{projectorMode === "constellations" ? "✦  Orion   ✧ Cassiopeia   ✦ Lyra   ✧ Pegasus" : projectorMode === "solar" ? "☉  · Mercury  · Venus  · Earth  · Mars  · Jupiter  · Saturn" : "01 · 02 · 04 · ? · 06 · 07"}</div>
            <button type="button" className="obs3-primary small" onClick={() => { setProjectorOn(true); setProjectorPanelOpen(false); showToast(`${projectorMode} projection spread across the dome.`); }}>project onto room</button>
            {projectorOn && <button type="button" className="obs3-secondary" onClick={() => setProjectorOn(false)}>switch projector off</button>}
          </section>
        </div>
      )}

      {orreryOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={() => setOrreryOpen(false)}>
          <section className="obs3-orrery-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <button type="button" className="obs3-close" onClick={()=>setOrreryOpen(false)}>×</button>
            <small>MECHANICAL ORRERY</small><h2>Interactive Solar System</h2><p>Move the planets, advance time, and click a world to inspect it.</p>
            <div className="solar-system-stage">
              <span className="solar-sun">☉</span>
              {ORRERY_PLANETS.map((planet) => {
                const angle = orreryAngles[planet.id] ?? 0;
                return <button key={planet.id} type="button" className={`solar-planet planet-${planet.id}`} style={{"--orbit": `${planet.orbit * 4}px`, "--angle": `${angle}deg`} as CSSProperties} onClick={()=>setSelectedPlanet(planet)} title={planet.name}><span>{planet.symbol}</span></button>
              })}
            </div>
            <div className="orrery-controls"><button onClick={()=>advanceOrrery(30)}>+30 days</button><button onClick={()=>advanceOrrery(180)}>+180 days</button><button onClick={()=>setOrreryRunning((v)=>!v)}>{orreryRunning?"pause mechanism":"resume mechanism"}</button></div>
            <article className="planet-card"><h3>{selectedPlanet.name}</h3><p>{selectedPlanet.fact}</p><label>orbit position <input type="range" min="0" max="359" value={orreryAngles[selectedPlanet.id] ?? 0} onChange={(e)=>setPlanetAngle(selectedPlanet.id, Number(e.target.value))}/></label></article>
          </section>
        </div>
      )}

      {moonLogOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={()=>setMoonLogOpen(false)}>
          <section className="obs3-moon-log" onMouseDown={(e)=>e.stopPropagation()}>
            <button type="button" className="obs3-close" onClick={()=>setMoonLogOpen(false)}>×</button>
            <small>LUNAR OBSERVATIONS</small><h2>Moon Notebook</h2>
            <div className="moon-grid">{MOON_PHASES.map((name,index)=><button key={name} className={loggedMoonPhases.includes(index)?"logged":""} onClick={()=>setMoonPhase(index)}><MoonPhaseVisual phase={index}/><strong>{name}</strong><span>{loggedMoonPhases.includes(index)?"✓ logged":"set phase"}</span></button>)}</div>
            <div className="moon-note"><b>APRIL 17 · 11:47 PM</b><p>“Something crossed the Moon, but the timing did not match any aircraft or satellite in the log.”</p></div>
          </section>
        </div>
      )}

      {ladderOpen && (
        <div className="obs3-modal-backdrop" onMouseDown={()=>setLadderOpen(false)}>
          <section className="obs3-ladder-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <button type="button" className="obs3-close" onClick={()=>setLadderOpen(false)}>×</button>
            <small>DOME MAINTENANCE PLATFORM</small><h2>Above the Bookshelves</h2>
            <div className="ladder-window">✦　·　✧　　☾　　·　✦</div>
            <p>A dusty box contains spare eyepieces, an old photograph of the hallway, and a message scratched into the wood:</p>
            <blockquote>DO NOT TRUST THE SKY ON APRIL 17.</blockquote>
            <p>{catMood >= 5 ? "A tiny brass star token is missing from the box. The cat looks deeply innocent." : "There is a cat-sized trail through the dust."}</p>
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
        <div className="obs3-modal-backdrop" onMouseDown={() => setCatalogOpen(false)}>
          <section className="obs3-catalog-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button type="button" className="obs3-close" onClick={() => setCatalogOpen(false)}>×</button>
            <small>CELESTIAL LOG</small>
            <h2>Things Found Above</h2>
            <p>{foundConstellations.length} constellations · {foundObjects.length} objects · {loggedMoonPhases.length} moon phases · {loggedRareEvents.length} rare sightings</p>

            <h3 className="catalog-section-title">Constellations & objects</h3>
            <div className="catalog-grid">
              {CONSTELLATIONS.map((c)=><button key={c.id} type="button" className={foundConstellations.includes(c.id)?"found":""} onClick={()=>{setCatalogOpen(false);setScopeOpen(true);centerOn(c.anchor,1.65);}}><strong>{foundConstellations.includes(c.id)?c.name:"???"}</strong><span>{foundConstellations.includes(c.id)?c.nickname:"unidentified constellation"}</span></button>)}
              {SKY_OBJECTS.map((o)=><button key={o.id} type="button" className={foundObjects.includes(o.id)?"found":""} onClick={()=>{setCatalogOpen(false);setScopeOpen(true);centerOn({x:o.x,y:o.y},Math.max(o.minZoom,1.55));}}><strong>{foundObjects.includes(o.id)?o.name:"???"}</strong><span>{foundObjects.includes(o.id)?o.short:`requires zoom ×${o.minZoom.toFixed(1)}`}</span></button>)}
            </div>

            <h3 className="catalog-section-title">Lunar observations</h3>
            <div className="catalog-mini-grid">
              {MOON_PHASES.map((phase, index) => (
                <div key={phase} className={loggedMoonPhases.includes(index) ? "catalog-mini-entry found" : "catalog-mini-entry"}>
                  <strong>{loggedMoonPhases.includes(index) ? phase : "unlogged phase"}</strong>
                  <span>{loggedMoonPhases.includes(index) ? "✓ observation recorded" : "use the moon dial to log it"}</span>
                </div>
              ))}
            </div>

            <h3 className="catalog-section-title">Rare sightings</h3>
            <div className="catalog-rare-summary">Research stamps: <b>{rareResearchScore}</b> · unique anomalies: <b>{loggedRareEvents.length}/{RARE_EVENTS.length}</b></div>
            <div className="catalog-mini-grid">
              {RARE_EVENTS.map((event) => {
                const record = rareLog.find((entry) => entry.id === event.id);
                const found = Boolean(record);
                return (
                  <button key={event.id} type="button" className={found ? "catalog-mini-entry catalog-rare-entry found" : "catalog-mini-entry catalog-rare-entry"} disabled={!found} onClick={() => setSelectedRareId(event.id)}>
                    <strong>{found ? `${event.icon} ${event.title}` : "unrecorded anomaly"}</strong>
                    <span>{found ? `${event.effectLabel} · seen ${record?.timesSeen ?? 1}×` : "keep moving the telescope"}</span>
                  </button>
                );
              })}
            </div>

            {selectedRareId && (() => {
              const event = RARE_EVENTS.find((entry) => entry.id === selectedRareId);
              const record = rareLog.find((entry) => entry.id === selectedRareId);
              if (!event || !record) return null;
              return <article className="catalog-rare-detail"><small>ARCHIVED SIGHTING</small><h3>{event.icon} {event.title}</h3><p>{event.description}</p><blockquote>{event.logNote}</blockquote><div><span>{event.effectLabel}</span><span>observed {record.timesSeen}×</span></div><button type="button" onClick={() => { setCatalogOpen(false); setScopeOpen(true); centerOn(event.focus, 1.8); }}>return to recorded coordinates</button></article>;
            })()}
          </section>
        </div>
      )}

      {toast && <div className="obs3-toast">{toast}</div>}
    </main>
  );
}

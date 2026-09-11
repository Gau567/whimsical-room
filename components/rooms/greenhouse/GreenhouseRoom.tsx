"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type GreenhouseZone = "greenhouse" | "potions" | "wands";
type PlantSlotId = "left" | "centre" | "right";
type IngredientId =
  | "moonflower"
  | "star-moss"
  | "night-dew"
  | "lavender"
  | "rosemary"
  | "silver-salt"
  | "fern-tip"
  | "rainwater"
  | "emberberry"
  | "cinnamon-bark"
  | "glass-thyme"
  | "violet-cap";

type WandId =
  | "rowan"
  | "willow"
  | "ash"
  | "hazel"
  | "yew"
  | "birch"
  | "elder"
  | "hawthorn";

type SpellId = "luma" | "verdant" | "motes" | "mendglass" | "raincall";

type RoomSave = {
  planted: Record<PlantSlotId, IngredientId | null>;
  watered: Record<PlantSlotId, number>;
  grownPlants: string[];
  potionHistory: string[];
  knownPotions: string[];
  spellsCast: string[];
  greenhouseCabinetOpened: boolean;
};

const STORAGE_KEY = "greenhouse-v1-progress";

const DEFAULT_SAVE: RoomSave = {
  planted: { left: null, centre: null, right: null },
  watered: { left: 0, centre: 0, right: 0 },
  grownPlants: [],
  potionHistory: [],
  knownPotions: [],
  spellsCast: [],
  greenhouseCabinetOpened: false,
};

const INGREDIENTS: Record<IngredientId, { name: string; icon: string; note: string }> = {
  moonflower: { name: "Moonflower Petal", icon: "☾", note: "opens only under false starlight" },
  "star-moss": { name: "Star Moss", icon: "✦", note: "cold to the touch" },
  "night-dew": { name: "Night Dew", icon: "◌", note: "collected before sunrise" },
  lavender: { name: "Lavender", icon: "❀", note: "calms restless mixtures" },
  rosemary: { name: "Rosemary", icon: "❧", note: "sharp, green, familiar" },
  "silver-salt": { name: "Silver Salt", icon: "◇", note: "sparkles when remembered" },
  "fern-tip": { name: "Fern Tip", icon: "♧", note: "always curls toward rain" },
  rainwater: { name: "Glasshouse Rain", icon: "⌁", note: "caught from the roof gutters" },
  emberberry: { name: "Emberberry", icon: "●", note: "warm enough to steam" },
  "cinnamon-bark": { name: "Cinnamon Bark", icon: "⌇", note: "smells like old cupboards" },
  "glass-thyme": { name: "Glass Thyme", icon: "✧", note: "almost transparent" },
  "violet-cap": { name: "Violet Cap", icon: "♠", note: "mushroom with purple dust" },
};

const PLANTABLE: IngredientId[] = ["moonflower", "star-moss", "fern-tip", "lavender", "violet-cap"];

const POTION_RECIPES = [
  {
    id: "lumen-tonic",
    name: "Lumen Tonic",
    colour: "pale gold",
    ingredients: ["moonflower", "star-moss", "night-dew"] as IngredientId[],
    use: "Makes hidden ink glow for a few minutes.",
  },
  {
    id: "memory-mist",
    name: "Memory Mist",
    colour: "silver-violet",
    ingredients: ["lavender", "rosemary", "silver-salt"] as IngredientId[],
    use: "Brings one forgotten detail sharply back into focus.",
  },
  {
    id: "verdant-draught",
    name: "Verdant Draught",
    colour: "deep green",
    ingredients: ["fern-tip", "rainwater", "moonflower"] as IngredientId[],
    use: "Encourages impossible growth in sleeping plants.",
  },
  {
    id: "ember-elixir",
    name: "Ember Elixir",
    colour: "orange-red",
    ingredients: ["emberberry", "cinnamon-bark", "silver-salt"] as IngredientId[],
    use: "Keeps a small flame alive without fuel.",
  },
  {
    id: "glasswalk",
    name: "Glasswalk Infusion",
    colour: "blue-clear",
    ingredients: ["glass-thyme", "night-dew", "rainwater"] as IngredientId[],
    use: "Makes reflections behave like doors for one breath.",
  },
] as const;

const RANDOM_POTION_RESULTS = [
  "The mixture sneezes glitter and immediately goes flat.",
  "A tiny raincloud forms over the cauldron and waters the floor.",
  "The potion turns plaid. Nobody knows why.",
  "A paper label appears on the bottle: DO NOT DRINK ON TRAINS.",
  "The cauldron briefly reflects a room that is not here.",
  "Everything smells like strawberries and wet stone.",
  "Three harmless blue sparks orbit the bottle like moons.",
  "The mixture whispers 11:47, then becomes completely ordinary.",
];

const WANDS: { id: WandId; name: string; wood: string; core: string; shape: string }[] = [
  { id: "rowan", name: "Rowan Wand", wood: "rowan", core: "moth-silk thread", shape: "slender · pale handle" },
  { id: "willow", name: "Willow Wand", wood: "willow", core: "moonflower fibre", shape: "curved · green binding" },
  { id: "ash", name: "Ash Wand", wood: "ash", core: "copper filament", shape: "straight · brass cap" },
  { id: "hazel", name: "Hazel Wand", wood: "hazel", core: "rain-glass splinter", shape: "knotted · blue stone" },
  { id: "yew", name: "Yew Wand", wood: "yew", core: "emberberry seed", shape: "dark · red thread" },
  { id: "birch", name: "Birch Wand", wood: "birch", core: "silver reed", shape: "white bark · ringed grip" },
  { id: "elder", name: "Elder Wand", wood: "elder", core: "star-moss braid", shape: "ridged · violet tip" },
  { id: "hawthorn", name: "Hawthorn Wand", wood: "hawthorn", core: "fern spine", shape: "crooked · leaf carving" },
];

const SPELLS: { id: SpellId; name: string; description: string; sequence: string[]; effect: string }[] = [
  { id: "luma", name: "Luma", description: "Summon a hovering warm light.", sequence: ["↑", "✦"], effect: "A golden light unfolds above the wand." },
  { id: "verdant", name: "Verdant Reach", description: "Coax vines toward a chosen surface.", sequence: ["←", "↑", "→"], effect: "Green vines race across the stone and bloom." },
  { id: "motes", name: "Mote Dance", description: "Call harmless firefly-like lights.", sequence: ["✦", "✦", "↑"], effect: "Dozens of bright motes drift around the room." },
  { id: "mendglass", name: "Mendglass", description: "Repair a small crack in glass.", sequence: ["↓", "←", "✦", "→"], effect: "A silver line seals the nearest cracked pane." },
  { id: "raincall", name: "Raincall", description: "Ask the greenhouse roof for rain.", sequence: ["↑", "↓", "↑", "✦"], effect: "Rain begins tapping the glass three rooms away." },
];

function sameIngredients(a: IngredientId[], b: readonly IngredientId[]) {
  if (a.length !== b.length) return false;
  return [...a].sort().join("|") === [...b].sort().join("|");
}

function randomWandId(): WandId {
  return WANDS[Math.floor(Math.random() * WANDS.length)].id;
}

export default function GreenhouseRoom() {
  const { returnToHub, hasItem, completeQuest, discoverClue } = useWorld();

  const [zone, setZone] = useState<GreenhouseZone>("greenhouse");
  const [save, setSave] = useState<RoomSave>(DEFAULT_SAVE);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("rain taps softly against the greenhouse roof.");
  const [recipePage, setRecipePage] = useState(0);

  const [cauldron, setCauldron] = useState<IngredientId[]>([]);
  const [brewing, setBrewing] = useState(false);
  const [brewResult, setBrewResult] = useState("The cauldron is quiet.");
  const [draggingIngredient, setDraggingIngredient] = useState<IngredientId | null>(null);

  const [chosenWandId, setChosenWandId] = useState<WandId | null>(null);
  const [equippedWandId, setEquippedWandId] = useState<WandId | null>(null);
  const [wandMessage, setWandMessage] = useState("The rack hums very faintly.");
  const [wandBurst, setWandBurst] = useState<"red" | "gold" | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<SpellId>("luma");
  const [gestureInput, setGestureInput] = useState<string[]>([]);
  const [spellEffect, setSpellEffect] = useState("Choose a spell from the wall, then trace its gesture.");
  const [spellPopup, setSpellPopup] = useState<SpellId | null>(null);

  const hasBrassKey = hasItem("small-brass-key") || hasItem("brass-key");
  const hasArcadeMoonflower = hasItem("moonflower-seed-packet");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<RoomSave>;
        setSave({
          ...DEFAULT_SAVE,
          ...parsed,
          planted: { ...DEFAULT_SAVE.planted, ...(parsed.planted ?? {}) },
          watered: { ...DEFAULT_SAVE.watered, ...(parsed.watered ?? {}) },
          grownPlants: Array.isArray(parsed.grownPlants) ? parsed.grownPlants : [],
          potionHistory: Array.isArray(parsed.potionHistory) ? parsed.potionHistory : [],
          knownPotions: Array.isArray(parsed.knownPotions) ? parsed.knownPotions : [],
          spellsCast: Array.isArray(parsed.spellsCast) ? parsed.spellsCast : [],
        });
      }
    } catch {
      // Fresh room state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {}
  }, [save, hydrated]);

  // A new wand chooses the player every time GreenhouseRoom mounts.
  // Moving between the three internal areas does NOT reroll it.
  useEffect(() => {
    setChosenWandId(randomWandId());
  }, []);

  useEffect(() => {
    if (!hasBrassKey) return;
    completeQuest("greenhouse-small-key");
    discoverClue("greenhouse-key-found");
  }, [hasBrassKey, completeQuest, discoverClue]);

  const availablePlantSeeds = useMemo(() => {
    const list = [...PLANTABLE];
    if (!hasArcadeMoonflower) return list.filter((id) => id !== "moonflower");
    return list;
  }, [hasArcadeMoonflower]);

  function updateSave(fn: (current: RoomSave) => RoomSave) {
    setSave((current) => fn(current));
  }

  function leaveGreenhouse() {
    // The component unmounts here. Coming back creates a fresh chosen-wand candidate.
    returnToHub();
  }

  function changeZone(next: GreenhouseZone) {
    setZone(next);
    setToast(
      next === "greenhouse"
        ? "warm daylight returns through fogged glass."
        : next === "potions"
          ? "the stone room smells of herbs, smoke and wet copper."
          : "hundreds of wand boxes seem to turn toward you at once.",
    );
  }

  function dragSeed(event: DragEvent<HTMLButtonElement>, ingredient: IngredientId) {
    setDraggingIngredient(ingredient);
    event.dataTransfer.setData("text/plain", ingredient);
    event.dataTransfer.effectAllowed = "copy";
  }

  function plantSeed(slot: PlantSlotId, ingredient?: IngredientId) {
    const seed = ingredient ?? draggingIngredient;
    if (!seed || !availablePlantSeeds.includes(seed)) return;
    updateSave((current) => ({
      ...current,
      planted: { ...current.planted, [slot]: seed },
      watered: { ...current.watered, [slot]: 0 },
    }));
    setToast(`${INGREDIENTS[seed].name} planted. It immediately leans toward the glass.`);
    setDraggingIngredient(null);
  }

  function waterPlant(slot: PlantSlotId) {
    const seed = save.planted[slot];
    if (!seed) {
      setToast("there is only damp soil in that pot.");
      return;
    }
    const nextWater = Math.min(3, save.watered[slot] + 1);
    updateSave((current) => ({
      ...current,
      watered: { ...current.watered, [slot]: nextWater },
      grownPlants:
        nextWater >= 2 && !current.grownPlants.includes(seed)
          ? [...current.grownPlants, seed]
          : current.grownPlants,
    }));
    setToast(nextWater >= 2 ? `${INGREDIENTS[seed].name} unfurls into something slightly impossible.` : "water darkens the soil.");
  }

  function openIngredientCabinet() {
    if (!hasBrassKey) {
      setToast("the cabinet has a tiny brass lock shaped like a leaf.");
      return;
    }
    updateSave((current) => ({ ...current, greenhouseCabinetOpened: true }));
    setToast("the Study key turns. Jars click awake behind the cabinet door.");
  }

  function startIngredientDrag(event: DragEvent<HTMLButtonElement>, ingredient: IngredientId) {
    event.dataTransfer.setData("text/plain", ingredient);
    event.dataTransfer.effectAllowed = "copy";
  }

  function addIngredient(ingredient: IngredientId) {
    if (cauldron.length >= 4) {
      setToast("the cauldron refuses a fifth ingredient.");
      return;
    }
    setCauldron((current) => [...current, ingredient]);
    setBrewResult(`${INGREDIENTS[ingredient].name} drops into the cauldron.`);
  }

  function dropIntoCauldron(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const ingredient = event.dataTransfer.getData("text/plain") as IngredientId;
    if (ingredient && INGREDIENTS[ingredient]) addIngredient(ingredient);
  }

  function clearCauldron() {
    setCauldron([]);
    setBrewResult("The cauldron empties itself with an offended little gulp.");
  }

  function stirCauldron() {
    if (brewing) return;
    if (cauldron.length < 2) {
      setBrewResult("The spoon clinks against an almost-empty cauldron.");
      return;
    }
    setBrewing(true);
    setBrewResult("You stir clockwise. The surface changes colour...");

    window.setTimeout(() => {
      const recipe = POTION_RECIPES.find((candidate) => sameIngredients(cauldron, candidate.ingredients));
      if (recipe) {
        const line = `${recipe.name} · ${recipe.use}`;
        updateSave((current) => ({
          ...current,
          potionHistory: [line, ...current.potionHistory].slice(0, 12),
          knownPotions: current.knownPotions.includes(recipe.id)
            ? current.knownPotions
            : [...current.knownPotions, recipe.id],
        }));
        setBrewResult(`${recipe.name} settles into a ${recipe.colour} glow. ${recipe.use}`);
      } else {
        const randomResult = RANDOM_POTION_RESULTS[Math.floor(Math.random() * RANDOM_POTION_RESULTS.length)];
        updateSave((current) => ({
          ...current,
          potionHistory: [`Unknown mixture · ${randomResult}`, ...current.potionHistory].slice(0, 12),
        }));
        setBrewResult(randomResult);
      }
      setCauldron([]);
      setBrewing(false);
    }, 900);
  }

  function tryWand(id: WandId) {
    if (!chosenWandId) return;
    setWandBurst(null);
    if (id === chosenWandId) {
      setEquippedWandId(id);
      setWandMessage(`${WANDS.find((wand) => wand.id === id)?.name} answers with warm gold light. It chose you.`);
      window.setTimeout(() => setWandBurst("gold"), 20);
    } else {
      setEquippedWandId(null);
      setWandMessage("The wand recoils and spits furious red sparks across the floor.");
      window.setTimeout(() => setWandBurst("red"), 20);
    }
  }

  function chooseSpell(id: SpellId) {
    setSelectedSpell(id);
    setGestureInput([]);
    const spell = SPELLS.find((item) => item.id === id)!;
    setSpellEffect(`${spell.name}: ${spell.description} Gesture: ${spell.sequence.join(" ")}`);
  }

  function pressGesture(symbol: string) {
    if (!equippedWandId) {
      setSpellEffect("The shelf notes are clear, but an unchosen wand will not cast anything.");
      return;
    }
    const spell = SPELLS.find((item) => item.id === selectedSpell)!;
    const next = [...gestureInput, symbol];
    const expected = spell.sequence[next.length - 1];

    if (symbol !== expected) {
      setGestureInput([]);
      setWandBurst("red");
      setSpellEffect("The gesture breaks. Red sparks skitter under the shelves.");
      return;
    }

    if (next.length === spell.sequence.length) {
      setGestureInput([]);
      setWandBurst("gold");
      setSpellEffect(spell.effect);
      setSpellPopup(spell.id);
      updateSave((current) => ({
        ...current,
        spellsCast: current.spellsCast.includes(spell.id)
          ? current.spellsCast
          : [...current.spellsCast, spell.id],
      }));
      return;
    }

    setGestureInput(next);
    setSpellEffect(`gesture forming · ${next.join(" ")}`);
  }

  function resetGreenhouseOnly() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSave(DEFAULT_SAVE);
    setCauldron([]);
    setBrewResult("The cauldron is quiet.");
    setEquippedWandId(null);
    setChosenWandId(randomWandId());
    setGestureInput([]);
    setSpellEffect("Room reset. The wand rack has changed its mind too.");
    setSpellPopup(null);
    setZone("greenhouse");
    setToast("the greenhouse settles back into its first morning.");
  }

  return (
    <main className={`greenhouse-room greenhouse-zone-${zone}`}>
      <div className="greenhouse-grain" aria-hidden="true" />

      <header className="greenhouse-header">
        <button type="button" className="greenhouse-hallway" onClick={leaveGreenhouse}>← hallway</button>
        <div>
          <p>ROOM 07 · BOTANICAL ANNEX</p>
          <h1>{zone === "greenhouse" ? "The Greenhouse" : zone === "potions" ? "The Brewing Room" : "The Wand Workshop"}</h1>
          <span>{zone === "greenhouse" ? "glass · rain · roots" : zone === "potions" ? "herbs · recipes · experiments" : "wood · gestures · strange loyalties"}</span>
        </div>
        <button type="button" className="greenhouse-reset" onClick={resetGreenhouseOnly}>↻ reset room 07</button>
      </header>

      <section className="greenhouse-scene">
        {zone === "greenhouse" && (
          <>
            <div className="gh-glass-roof" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
            <div className="gh-vines" aria-hidden="true"><span>❧</span><span>❧</span><span>❧</span></div>
            <div className="gh-immersive-decor" aria-hidden="true">
              <div className="gh-sunbeams"><i/><i/><i/></div>
              <div className="gh-hanging-pots"><span>♧</span><span>❧</span><span>✿</span><span>♧</span></div>
              <div className="gh-back-shelves gh-back-shelves-left"><i/><i/><i/><i/><i/><i/></div>
              <div className="gh-back-shelves gh-back-shelves-right"><i/><i/><i/><i/><i/></div>
              <div className="gh-workbench-clutter"><span>🪴</span><span>🫙</span><span>✂</span><span>🧤</span><span>🪣</span></div>
              <div className="gh-watering-can">◒</div>
              <div className="gh-floor-puddles"><i/><i/><i/></div>
              <div className="gh-leaf-drift">{Array.from({ length: 9 }).map((_, index) => <i key={index}>⌁</i>)}</div>
            </div>

            <button className="gh-zone-arrow gh-zone-arrow-left" type="button" onClick={() => changeZone("potions")}>
              <b>‹</b><span>brewing room</span>
            </button>

            <div className="gh-title-plaque">
              <small>THE OLD GLASSHOUSE</small>
              <strong>grow something the building has forgotten</strong>
            </div>

            <section className="gh-seed-bench">
              <header><span>SEED & CUTTING TRAY</span><small>drag or click, then choose a pot</small></header>
              <div className="gh-seed-grid">
                {availablePlantSeeds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    draggable
                    className={draggingIngredient === id ? "is-selected" : ""}
                    onDragStart={(event) => dragSeed(event, id)}
                    onClick={() => {
                      setDraggingIngredient(id);
                      setToast(`${INGREDIENTS[id].name} selected · drop it into a pot.`);
                    }}
                  >
                    <span>{INGREDIENTS[id].icon}</span>
                    <strong>{INGREDIENTS[id].name}</strong>
                    <small>{INGREDIENTS[id].note}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="gh-potting-table">
              {(["left", "centre", "right"] as PlantSlotId[]).map((slot) => {
                const planted = save.planted[slot];
                const water = save.watered[slot];
                const grown = planted ? save.grownPlants.includes(planted) : false;
                return (
                  <div
                    key={slot}
                    className={`gh-pot ${grown ? "is-grown" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const id = (event.dataTransfer.getData("text/plain") || draggingIngredient) as IngredientId;
                      plantSeed(slot, id);
                    }}
                  >
                    <div className="gh-plant-visual">{planted ? (grown ? `${INGREDIENTS[planted].icon}❧` : INGREDIENTS[planted].icon) : "·"}</div>
                    <strong>{planted ? INGREDIENTS[planted].name : "empty pot"}</strong>
                    <small>{planted ? `water ${water}/2` : "drop a cutting here"}</small>
                    <div className="gh-pot-buttons">
                      {!planted && draggingIngredient && <button type="button" onClick={() => plantSeed(slot)}>PLANT</button>}
                      <button type="button" onClick={() => waterPlant(slot)}>WATER</button>
                    </div>
                  </div>
                );
              })}
            </section>

            <button className={`gh-ingredient-cabinet ${save.greenhouseCabinetOpened ? "is-open" : ""}`} type="button" onClick={openIngredientCabinet}>
              <span>⚿</span>
              <strong>{save.greenhouseCabinetOpened ? "INGREDIENT CABINET OPEN" : "TINY LEAF LOCK"}</strong>
              <small>{hasBrassKey ? "the Study key fits" : "something brass belongs here"}</small>
            </button>

            <section className="gh-growing-log">
              <small>BOTANICAL LOG</small>
              <strong>{save.grownPlants.length} specimens grown</strong>
              <p>{save.grownPlants.length ? save.grownPlants.map((id) => INGREDIENTS[id as IngredientId]?.name ?? id).join(" · ") : "nothing has taken root yet"}</p>
            </section>
          </>
        )}

        {zone === "potions" && (
          <>
            <div className="potions-stone-wall" aria-hidden="true" />
            <div className="potion-lab-decor" aria-hidden="true">
              <div className="potion-rain-window"><i/><i/><i/><i/><i/></div>
              <div className="potion-hanging-herbs"><span>❧</span><span>❀</span><span>♧</span><span>❧</span><span>✾</span></div>
              <div className="potion-lantern"><i /></div>
              <div className="potion-back-shelf potion-back-shelf-a"><b>▥</b><i/><i/><i/><i/><i/><i/><i/></div>
              <div className="potion-back-shelf potion-back-shelf-b"><i/><i/><i/><i/><i/><i/></div>
              <div className="potion-table-clutter"><span>⚗</span><span>⌛</span><span>⚖</span><span>🕯</span></div>
            </div>
            <button className="gh-zone-arrow gh-zone-arrow-left" type="button" onClick={() => changeZone("greenhouse")}><b>‹</b><span>greenhouse</span></button>
            <button className="gh-zone-arrow gh-zone-arrow-right" type="button" onClick={() => changeZone("wands")}><span>wand workshop</span><b>›</b></button>

            <aside className="potion-shelf potion-shelf-left">
              <h3>DRY HERBS</h3>
              {(["moonflower", "star-moss", "lavender", "rosemary", "fern-tip", "cinnamon-bark"] as IngredientId[]).map((id) => (
                <button key={id} type="button" className={`potion-ingredient potion-ingredient-${id}`} draggable onDragStart={(event) => startIngredientDrag(event, id)} onClick={() => addIngredient(id)}>
                  <span className="potion-ingredient-vessel"><i>{INGREDIENTS[id].icon}</i></span>
                  <span className="potion-ingredient-copy"><b>{INGREDIENTS[id].name}</b><small>{INGREDIENTS[id].note}</small></span>
                </button>
              ))}
            </aside>

            <aside className="potion-shelf potion-shelf-right">
              <h3>JARS & LIQUIDS</h3>
              {(["night-dew", "silver-salt", "rainwater", "emberberry", "glass-thyme", "violet-cap"] as IngredientId[]).map((id) => (
                <button key={id} type="button" className={`potion-ingredient potion-ingredient-${id}`} draggable onDragStart={(event) => startIngredientDrag(event, id)} onClick={() => addIngredient(id)}>
                  <span className="potion-ingredient-vessel"><i>{INGREDIENTS[id].icon}</i></span>
                  <span className="potion-ingredient-copy"><b>{INGREDIENTS[id].name}</b><small>{INGREDIENTS[id].note}</small></span>
                </button>
              ))}
            </aside>

            <section className="potion-book">
              <header><small>THE APOTHECARY INDEX · RECIPE {recipePage + 1}/{POTION_RECIPES.length}</small><strong>Practical Brews & Unwise Experiments</strong></header>
              <article>
                <h3>{POTION_RECIPES[recipePage].name}</h3>
                <p className="potion-recipe-icons">{POTION_RECIPES[recipePage].ingredients.map((id) => INGREDIENTS[id].icon).join(" + ")}</p>
                <p>{POTION_RECIPES[recipePage].ingredients.map((id) => INGREDIENTS[id].name).join(" · ")}</p>
                <blockquote>{POTION_RECIPES[recipePage].use}</blockquote>
              </article>
              <footer>
                <button type="button" onClick={() => setRecipePage((recipePage + POTION_RECIPES.length - 1) % POTION_RECIPES.length)}>← previous</button>
                <button type="button" onClick={() => setRecipePage((recipePage + 1) % POTION_RECIPES.length)}>next →</button>
              </footer>
            </section>

            <div className="potion-cauldron-wrap">
              <div
                className={`potion-cauldron ${brewing ? "is-brewing" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={dropIntoCauldron}
              >
                <div className="potion-liquid"><i/><i/><i/><i/><i/></div>
                <div className="potion-steam" aria-hidden="true"><i/><i/><i/><i/></div>
                <strong>{cauldron.length ? "CAULDRON CONTENTS" : "DROP INGREDIENTS"}</strong>
                {cauldron.length > 0 && (
                  <div className="potion-cauldron-contents">
                    {cauldron.map((id, index) => <span key={`${id}-${index}`}>{INGREDIENTS[id].icon} {INGREDIENTS[id].name}</span>)}
                  </div>
                )}
              </div>
              <div className="potion-controls">
                <button type="button" onClick={stirCauldron} disabled={brewing}>STIR CAULDRON</button>
                <button type="button" onClick={clearCauldron}>EMPTY</button>
              </div>
              <p>{brewResult}</p>
            </div>

            <section className="potion-history">
              <small>BREWING NOTES</small>
              {save.potionHistory.length ? save.potionHistory.slice(0, 5).map((item, index) => <p key={`${item}-${index}`}>{item}</p>) : <p>no successful disasters yet</p>}
            </section>
          </>
        )}

        {zone === "wands" && (
          <>
            <div className="wand-dark-wall" aria-hidden="true" />
            <div className="wand-workshop-decor" aria-hidden="true">
              <div className="wand-ceiling-beams"><i/><i/><i/><i/></div>
              <div className="wand-hanging-lamps"><span><i/></span><span><i/></span><span><i/></span></div>
              <div className="wand-box-wall wand-box-wall-left">{Array.from({ length: 22 }).map((_, index) => <i key={index} />)}</div>
              <div className="wand-box-wall wand-box-wall-right">{Array.from({ length: 18 }).map((_, index) => <i key={index} />)}</div>
              <div className="wand-wood-shelf wand-wood-shelf-a"><i/><i/><i/><i/><i/></div>
              <div className="wand-wood-shelf wand-wood-shelf-b"><i/><i/><i/><i/></div>
              <div className="wand-dust-motes">{Array.from({ length: 14 }).map((_, index) => <i key={index} />)}</div>
              <div className="wand-floor-runner" />
            </div>
            <button className="gh-zone-arrow gh-zone-arrow-left" type="button" onClick={() => changeZone("potions")}><b>‹</b><span>brewing room</span></button>

            <div className={`wand-sparks wand-sparks-${wandBurst ?? "none"}`} key={`${wandBurst}-${wandMessage}`} aria-hidden="true">
              {Array.from({ length: 14 }).map((_, index) => <i key={index} />)}
            </div>

            <section className="wand-rack">
              <header>
                <small>THE RACK CHOOSES TOO</small>
                <h2>Pick a wand.</h2>
                <p>Only one is listening this visit. Leave Room 07 completely and return, and the answer may change.</p>
              </header>
              <div className="wand-grid">
                {WANDS.map((wand, index) => (
                  <button
                    key={wand.id}
                    type="button"
                    className={equippedWandId === wand.id ? "is-chosen" : ""}
                    onClick={() => tryWand(wand.id)}
                  >
                    <span className={`wand-stick wand-stick-${index}`} />
                    <strong>{wand.name}</strong>
                    <small>{wand.shape}</small>
                  </button>
                ))}
              </div>
              <p className="wand-message">{wandMessage}</p>
            </section>

            <section className="spell-library">
              <header><small>SPELL SHELVES</small><strong>gesture index</strong></header>
              <div className="spell-cards">
                {SPELLS.map((spell) => (
                  <button key={spell.id} type="button" className={selectedSpell === spell.id ? "is-active" : ""} onClick={() => chooseSpell(spell.id)}>
                    <strong>{spell.name}</strong>
                    <span>{spell.sequence.join(" ")}</span>
                    <small>{spell.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="spell-casting-desk">
              <small>CASTING DESK</small>
              <strong>{SPELLS.find((spell) => spell.id === selectedSpell)?.name}</strong>
              <div className="gesture-buttons">
                {["↑", "→", "↓", "←", "✦"].map((symbol) => <button key={symbol} type="button" onClick={() => pressGesture(symbol)}>{symbol}</button>)}
              </div>
              <p>{spellEffect}</p>
              <span>{equippedWandId ? `wand: ${WANDS.find((wand) => wand.id === equippedWandId)?.name}` : "no wand has chosen you yet"}</span>
            </section>

            {spellPopup && (() => {
              const popupSpell = SPELLS.find((spell) => spell.id === spellPopup)!;
              return (
                <div className={`spell-cast-popup spell-cast-popup-${popupSpell.id}`} role="dialog" aria-modal="true">
                  <button type="button" className="spell-popup-close" onClick={() => setSpellPopup(null)}>×</button>
                  <div className="spell-popup-stage" aria-hidden="true">
                    {popupSpell.id === "luma" && <><span className="spell-luma-orb">✦</span><i/><i/><i/><i/><i/></>}
                    {popupSpell.id === "verdant" && <><span className="spell-vine vine-a">❧</span><span className="spell-vine vine-b">❧</span><span className="spell-vine vine-c">❧</span></>}
                    {popupSpell.id === "motes" && Array.from({ length: 18 }).map((_, index) => <i className={`spell-mote mote-${index % 6}`} key={index} />)}
                    {popupSpell.id === "mendglass" && <div className="spell-glass-pane"><i/><i/><i/><i/></div>}
                    {popupSpell.id === "raincall" && <div className="spell-rain-sheet">{Array.from({ length: 14 }).map((_, index) => <i key={index}/>)}</div>}
                  </div>
                  <div className="spell-popup-card">
                    <small>SPELL CAST SUCCESSFULLY</small>
                    <h2>{popupSpell.name}</h2>
                    <p>{popupSpell.effect}</p>
                    <button type="button" onClick={() => setSpellPopup(null)}>LET THE MAGIC SETTLE</button>
                  </div>
                </div>
              );
            })()}

            <section className="spell-progress">
              <small>SPELLS CAST</small>
              <strong>{save.spellsCast.length}/{SPELLS.length}</strong>
              <div>{SPELLS.map((spell) => <i key={spell.id} className={save.spellsCast.includes(spell.id) ? "is-on" : ""} />)}</div>
            </section>
          </>
        )}

        <p className="greenhouse-toast" aria-live="polite">{toast}</p>
      </section>
    </main>
  );
}

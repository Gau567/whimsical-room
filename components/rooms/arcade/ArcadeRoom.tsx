"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type Zone = 0 | 1 | 2;
type Modal = null | "token" | "prizes" | "collection" | "food" | "scores" | "reaction" | "slots" | "twentyone" | "basketball" | "clown" | "beanbag" | "claw" | "wheel" | "highlow" | "dice" | "triplestar" | "secret";
type ReactionState = "idle" | "waiting" | "ready" | "done" | "too-early";
type CollectibleId = "pixel-bear" | "moon-bunny" | "tiny-astronomer" | "ghost-cat" | "pocket-atlas" | "crt-robot";

type ArcadeSave = {
  tokens: number;
  tickets: number;
  welcomeClaimed: boolean;
  tokenStamp: number;
  wins: string[];
  highScores: Record<string, number>;
  secretBooted: boolean;
  claimedDisk: boolean;
  claimedFragment: boolean;
  claimedStarBonus: boolean;
  foodTried: string[];
  purchasedPrizes: string[];
  collectibles: CollectibleId[];
  paidPlays: number;
};

const STORAGE_KEY = "arcade-v3-progress";
const DEFAULT_SAVE: ArcadeSave = {
  tokens: 7,
  tickets: 0,
  welcomeClaimed: false,
  tokenStamp: 0,
  wins: [],
  highScores: {},
  secretBooted: false,
  claimedDisk: false,
  claimedFragment: false,
  claimedStarBonus: false,
  foodTried: [],
  purchasedPrizes: [],
  collectibles: [],
  paidPlays: 0,
};

const ZONES = [
  { eyebrow: "ROOM 03-A", title: "Main Floor", subtitle: "classics · lights · local scores" },
  { eyebrow: "ROOM 03-B", title: "Midway", subtitle: "basketball · carnival games · claw alley" },
  { eyebrow: "ROOM 03-C", title: "Jackpot Lounge", subtitle: "late-night tables · hefty ticket wins" },
] as const;

const SLOT_SYMBOLS = ["★", "7", "🍒", "◆", "☾", "✦"];
const CLAW_TOYS: { id: CollectibleId; icon: string; name: string; note: string; useIn?: "nostalgia" | "dream" | "observatory" }[] = [
  { id: "pixel-bear", icon: "🧸", name: "Pixel Bear", note: "a square little bear with one wonky ear", useIn: "nostalgia" },
  { id: "moon-bunny", icon: "🐇", name: "Moon Bunny", note: "silver plush with stars stitched into its feet", useIn: "dream" },
  { id: "tiny-astronomer", icon: "🔭", name: "Tiny Astronomer", note: "a ridiculous telescope figurine", useIn: "observatory" },
  { id: "ghost-cat", icon: "🐈", name: "Ghost Cat", note: "glows faintly when nobody is looking", useIn: "dream" },
  { id: "pocket-atlas", icon: "📘", name: "Pocket Star Atlas", note: "tiny book: SOME SKIES ARE INDOORS", useIn: "observatory" },
  { id: "crt-robot", icon: "🤖", name: "CRT Robot", note: "its face is a tiny blue screen", useIn: "nostalgia" },
];

const FOOD = [
  ["fries", "🍟", "Pixel Fries", "crispy, salty, suspiciously perfect cubes"],
  ["soda", "🥤", "Neon Soda", "blue raspberry, allegedly"],
  ["popcorn", "🍿", "Jackpot Popcorn", "NO REFUNDS AFTER PROPHECY"],
  ["pretzel", "🥨", "Power-Up Pretzel", "+0 stats · +12 morale"],
  ["nachos", "🧀", "Critical Hit Nachos", "the cheese is brighter than the carpet"],
  ["shake", "🥛", "Save Point Shake", "strawberry and too many sprinkles"],
] as const;

const PRIZES = [
  ["stickers", "✨", "Holographic Sticker Pack", 8, "tiny cabinet decals"],
  ["candy", "🍬", "Mystery Candy Tube", 12, "probably edible"],
  ["alien", "👾", "Glow Alien", 18, "decorative · adorable · zero lore"],
  ["keychain", "🕹️", "Mini Joystick Keychain", 25, "clicks satisfyingly"],
  ["poster", "🖼️", "Neon Clover Poster", 30, "future Nostalgia wall collectible"],
  ["seed", "🌱", "Moonflower Seeds", 35, "future Greenhouse item"],
  ["cassette", "📼", "Blank Arcade Mixtape", 40, "future Nostalgia item"],
  ["mirror", "◌", "Mirror Token", 45, "future Dream Room item"],
  ["planet", "🪐", "Glass Planet Charm", 55, "Observatory shelf collectible"],
  ["plush", "🧸", "Giant Clover Plush", 65, "objectively too large"],
] as const;

const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ArcadeRoom() {
  const { returnToHub, hasItem, addItem, completeQuest, discoverClue } = useWorld();
  const [zone, setZone] = useState<Zone>(0);
  const [save, setSave] = useState<ArcadeSave>(DEFAULT_SAVE);
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("the carpet is louder than the music.");
  const [marqueeOn, setMarqueeOn] = useState(true);

  const [reels, setReels] = useState(["7", "★", "🍒"]);
  const [slotMessage, setSlotMessage] = useState("1 token per spin");
  const [spinning, setSpinning] = useState(false);
  const [reactionState, setReactionState] = useState<ReactionState>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const reactionReadyAt = useRef(0);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cards, setCards] = useState<number[]>([8, 7]);
  const [twentyOneActive, setTwentyOneActive] = useState(false);
  const [twentyOneMessage, setTwentyOneMessage] = useState("target 21");

  const [basketShots, setBasketShots] = useState<number[]>([]);
  const [basketMessage, setBasketMessage] = useState("5 shots · 1 token");
  const [clownHits, setClownHits] = useState(0);
  const [clownTarget, setClownTarget] = useState(3);
  const [clownActive, setClownActive] = useState(false);
  const [clownTime, setClownTime] = useState(10);
  const clownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [beanbagScore, setBeanbagScore] = useState(0);
  const [beanbagThrows, setBeanbagThrows] = useState(0);
  const [clawPosition, setClawPosition] = useState(50);
  const [clawMessage, setClawMessage] = useState("line up the claw, then DROP");

  const [wheelValue, setWheelValue] = useState<number | null>(null);
  const [highLowCard, setHighLowCard] = useState(7);
  const [highLowMessage, setHighLowMessage] = useState("will the next card be higher or lower?");
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [triple, setTriple] = useState(["★", "◆", "★"]);

  const hasStarFragment = hasItem("star-fragment");
  const uniqueWins = new Set(save.wins).size;
  const secretAvailable = uniqueWins >= 5;
  const total21 = cards.reduce((a, b) => a + b, 0);
  const zoneInfo = ZONES[zone];

  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const old = localStorage.getItem("arcade-v1-progress");
      if (current) {
        const p = JSON.parse(current) as Partial<ArcadeSave>;
        setSave({ ...DEFAULT_SAVE, ...p, wins: Array.isArray(p.wins) ? p.wins : [], foodTried: Array.isArray(p.foodTried) ? p.foodTried : [], purchasedPrizes: Array.isArray(p.purchasedPrizes) ? p.purchasedPrizes : [], collectibles: Array.isArray(p.collectibles) ? p.collectibles as CollectibleId[] : [], highScores: { ...(p.highScores ?? {}) } });
      } else if (old) {
        const p = JSON.parse(old) as Partial<ArcadeSave>;
        setSave({ ...DEFAULT_SAVE, ...p, tokens: Math.max(p.tokens ?? 0, 7), wins: Array.isArray(p.wins) ? p.wins : [], foodTried: Array.isArray(p.foodTried) ? p.foodTried : [], highScores: { ...(p.highScores ?? {}) }, purchasedPrizes: [], collectibles: [] });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); } catch {}
  }, [save, hydrated]);

  useEffect(() => () => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    if (clownTimer.current) clearInterval(clownTimer.current);
  }, []);

  const scoreRows = useMemo(() => [
    ["QUICKDRAW", "reaction"], ["LUCKY 7", "slots"], ["TWENTY ONE", "twentyone"],
    ["HOOP FEVER", "basketball"], ["HIT THE CLOWN", "clown"], ["BEANBAG", "beanbag"],
    ["LUCKY WHEEL", "wheel"], ["HIGH / LOW", "highlow"], ["DICE DUEL", "dice"], ["TRIPLE STAR", "triplestar"],
  ], []);

  const update = (fn: (s: ArcadeSave) => ArcadeSave) => setSave(fn);
  const awardTickets = (amount: number, msg?: string) => { update(s => ({ ...s, tickets: s.tickets + amount })); if (msg) setToast(msg); };
  const markWin = (game: string) => update(s => ({ ...s, wins: s.wins.includes(game) ? s.wins : [...s.wins, game] }));
  const highScore = (game: string, value: number) => update(s => ({ ...s, highScores: { ...s.highScores, [game]: Math.max(s.highScores[game] ?? 0, value) } }));
  const spend = (cost: number) => {
    if (cost === 0) return true;
    if (save.tokens < cost) { setToast(`need ${cost} token${cost === 1 ? "" : "s"} · visit the token counter.`); setModal("token"); return false; }
    update(s => ({ ...s, tokens: s.tokens - cost, paidPlays: s.paidPlays + 1 }));
    return true;
  };

  function moveZone(dir: -1 | 1) { setZone((((zone + dir) + 3) % 3) as Zone); setToast(dir > 0 ? "you follow the neon arrow deeper inside." : "you head back through the arcade arch."); }

  function claimWelcome() {
    if (save.welcomeClaimed) return;
    update(s => ({ ...s, tokens: s.tokens + 8, welcomeClaimed: true }));
    setToast("eight fresh NEON CLOVER tokens clatter into the tray.");
  }
  function claimStamp() {
    const stamps = Math.floor(save.paidPlays / 4);
    if (stamps <= save.tokenStamp) { setToast("play four paid rounds to earn the next refill."); return; }
    const due = stamps - save.tokenStamp;
    update(s => ({ ...s, tokens: s.tokens + due * 3, tokenStamp: stamps }));
    setToast(`PLAYER CARD stamped · +${due * 3} tokens.`);
  }
  function tradeTickets() {
    if (save.tickets < 15) return;
    update(s => ({ ...s, tickets: s.tickets - 15, tokens: s.tokens + 4 }));
    setToast("15 tickets exchanged for 4 tokens.");
  }
  function emergency() {
    if (save.tokens > 0) return;
    update(s => ({ ...s, tokens: s.tokens + 3 }));
    setToast("EMERGENCY FREE PLAY · +3 tokens.");
  }

  function startReaction() {
    if (reactionState === "waiting" || reactionState === "ready") return;
    setReactionState("waiting"); setReactionMs(null);
    reactionTimer.current = setTimeout(() => { reactionReadyAt.current = performance.now(); setReactionState("ready"); }, rand(1100, 2800));
  }
  function hitReaction() {
    if (reactionState === "waiting") { if (reactionTimer.current) clearTimeout(reactionTimer.current); setReactionState("too-early"); return; }
    if (reactionState !== "ready") return;
    const ms = Math.round(performance.now() - reactionReadyAt.current);
    const payout = ms <= 240 ? 30 : ms <= 330 ? 20 : ms <= 420 ? 12 : 5;
    setReactionMs(ms); setReactionState("done"); awardTickets(payout); highScore("reaction", clamp(650 - ms, 50, 550)); if (ms <= 420) markWin("quickdraw");
  }
  function spinSlots() {
    if (spinning || !spend(1)) return;
    setSpinning(true); setSlotMessage("reels rattling...");
    setTimeout(() => {
      const next = [0,1,2].map(() => SLOT_SYMBOLS[rand(0, SLOT_SYMBOLS.length - 1)]); setReels(next);
      const same3 = next.every(v => v === next[0]); const same2 = next[0] === next[1] || next[1] === next[2] || next[0] === next[2]; const sevens = next.filter(v => v === "7").length;
      let payout = 4; if (same3 && next[0] === "7") payout = 60; else if (same3) payout = 35; else if (sevens >= 2) payout = 25; else if (same2) payout = 12;
      awardTickets(payout); highScore("slots", payout); if (payout >= 12) markWin("lucky-seven"); setSlotMessage(`${payout} TICKETS`); setSpinning(false);
    }, 650);
  }
  function start21() { if (!spend(2)) return; setCards([rand(2,10), rand(2,10)]); setTwentyOneActive(true); setTwentyOneMessage("hit or stand"); }
  function finish21(finalCards = cards) {
    const total = finalCards.reduce((a,b) => a+b,0); setTwentyOneActive(false);
    let payout = total === 21 ? 42 : total === 20 ? 30 : total === 19 ? 22 : total >= 17 && total <= 21 ? 14 : total > 21 ? 2 : 6;
    awardTickets(payout); highScore("twentyone", total <= 21 ? total : 0); if (total >= 17 && total <= 21) markWin("twenty-one"); setTwentyOneMessage(`${total > 21 ? "BUST · " : ""}${total} · ${payout} tickets`);
  }
  function hit21() { if (!twentyOneActive) return; const next = [...cards, rand(1,10)]; setCards(next); if (next.reduce((a,b)=>a+b,0) >= 21) finish21(next); }

  function startBasketball() { if (!spend(1)) return; setBasketShots([]); setBasketMessage("tap SHOOT five times"); }
  function basketShoot() {
    if (basketShots.length >= 5) return;
    const next = [...basketShots, Math.random() > .37 ? 1 : 0]; setBasketShots(next);
    if (next.length === 5) { const baskets = next.reduce((a,b)=>a+b,0); const payout = baskets * 8 + (baskets === 5 ? 20 : 0); awardTickets(payout); highScore("basketball", baskets); if (baskets >= 3) markWin("basketball"); setBasketMessage(`${baskets}/5 baskets · ${payout} tickets`); }
  }
  function startClown() {
    if (clownActive) return; if (clownTimer.current) clearInterval(clownTimer.current); setClownHits(0); setClownTime(10); setClownTarget(rand(0,8)); setClownActive(true);
    let time = 10; clownTimer.current = setInterval(() => { time--; setClownTime(time); setClownTarget(rand(0,8)); if (time <= 0) { if (clownTimer.current) clearInterval(clownTimer.current); setClownActive(false); } }, 1000);
  }
  function whack(index: number) { if (!clownActive || index !== clownTarget) return; const hits = clownHits + 1; setClownHits(hits); setClownTarget(rand(0,8)); if (hits === 5) { awardTickets(25, "five clowns bonked · 25 tickets."); markWin("hit-the-clown"); } else if (hits > 5) awardTickets(3); highScore("clown", hits); }
  function startBeanbag() { if (!spend(1)) return; setBeanbagScore(0); setBeanbagThrows(3); }
  function throwBeanbag(points: number) { if (beanbagThrows <= 0) return; const score = beanbagScore + points; const left = beanbagThrows - 1; setBeanbagScore(score); setBeanbagThrows(left); if (left === 0) { const payout = Math.max(5, score * 2); awardTickets(payout); highScore("beanbag", score); if (score >= 18) markWin("beanbag"); } }
  function dropClaw() {
    if (!spend(2)) return;
    const success = Math.random() > .42;
    if (!success) { awardTickets(3); setClawMessage("the claw slips dramatically · 3 consolation tickets"); return; }
    const available = CLAW_TOYS.filter(t => !save.collectibles.includes(t.id)); const toy = available.length ? available[rand(0, available.length - 1)] : CLAW_TOYS[rand(0, CLAW_TOYS.length - 1)];
    if (save.collectibles.includes(toy.id)) { awardTickets(15); setClawMessage("duplicate toy traded automatically for 15 tickets"); return; }
    update(s => ({ ...s, collectibles: [...s.collectibles, toy.id] }));
    addItem({ id: `arcade-${toy.id}`, name: toy.name, icon: toy.icon, description: `${toy.note}. Won from Neon Clover's claw alley.`, sourceRoom: "arcade", ...(toy.useIn ? { useIn: toy.useIn } : {}) });
    markWin("claw-alley"); setClawMessage(`GOT IT · ${toy.icon} ${toy.name}`);
  }

  function spinWheel() { if (!spend(2)) return; const options = [5,8,12,20,30,50,75]; const payout = options[rand(0,options.length-1)]; setWheelValue(payout); awardTickets(payout); highScore("wheel", payout); if (payout >= 30) markWin("lucky-wheel"); }
  function guessHighLow(dir: "high" | "low") { if (!spend(1)) return; const next = rand(1,13); const correct = dir === "high" ? next > highLowCard : next < highLowCard; const equal = next === highLowCard; const payout = equal ? 5 : correct ? 18 : 2; awardTickets(payout); setHighLowMessage(`${highLowCard} → ${next} · ${correct ? "CORRECT" : equal ? "PUSH" : "MISS"} · ${payout} tickets`); if (correct) { markWin("high-low"); highScore("highlow", 18); } setHighLowCard(next); }
  function rollDice() { if (!spend(2)) return; const next: [number, number] = [rand(1,6),rand(1,6)]; setDice(next); const sum = next[0]+next[1]; let payout = 4; if (next[0]===next[1]) payout=35; if(sum===7)payout=28; if(sum===12)payout=55; awardTickets(payout); highScore("dice",payout); if(payout>=28)markWin("dice-duel"); }
  function playTriple() { if(!spend(3))return; const symbols=["★","☾","◆","♣"]; const next=[0,1,2].map(()=>symbols[rand(0,symbols.length-1)]); setTriple(next); const stars=next.filter(x=>x==="★").length; const same=next.every(x=>x===next[0]); let payout=8; if(same&&next[0]==="★")payout=120; else if(same)payout=70; else if(stars===2)payout=45; else if(stars===1)payout=18; awardTickets(payout); highScore("triplestar",payout); if(payout>=45)markWin("triple-star"); }

  function starCabinet() { if(!hasStarFragment){setToast("STAR CHASER: INSERT SOMETHING THAT REMEMBERS THE SKY.");return;} if(save.claimedStarBonus){setToast("stellar signature already saved.");return;} awardTickets(15,"Star Fragment recognised · +15 celestial tickets."); discoverClue("arcade-starlight-recognised"); update(s=>({...s,claimedStarBonus:true})); }
  function bootSecret() { if(!secretAvailable){setToast(`OUT OF ORDER · clear ${5-uniqueWins} more different game${5-uniqueWins===1?"":"s"}.`);return;} setModal("secret"); if(!save.secretBooted){update(s=>({...s,secretBooted:true})); discoverClue("arcade-corrupted-save"); discoverClue("train-platform-seven");} }
  function takeDisk() { if(save.claimedDisk)return; addItem({id:"retro-system-disk",name:"Retro System Disk",icon:"▣",description:"A translucent save disk labelled NOSTALGIA_01. Scratched into the back: 04/17 · P7 · 11:47.",sourceRoom:"arcade",useIn:"nostalgia"}); discoverClue("arcade-nostalgia-disk"); update(s=>({...s,claimedDisk:true})); setToast("Retro System Disk added to Backpack."); }
  function buyPrize(id:string,cost:number) {
    if(save.tickets<cost||save.purchasedPrizes.includes(id))return; const p=PRIZES.find(x=>x[0]===id); if(!p)return;
    update(s=>({...s,tickets:s.tickets-cost,purchasedPrizes:[...s.purchasedPrizes,id]}));
    if(id==="seed")addItem({id:"moonflower-seed-packet",name:"Moonflower Seed Packet",icon:"✿",description:"Arcade prize packet marked: WATER ONLY UNDER FALSE STARLIGHT.",sourceRoom:"arcade",useIn:"greenhouse"});
    if(id==="mirror")addItem({id:"mirror-token",name:"Mirror Token",icon:"◌",description:"A polished arcade token. Your reflection seems half a second late.",sourceRoom:"arcade",useIn:"dream"});
    if(id==="cassette")addItem({id:"arcade-mixtape",name:"Blank Arcade Mixtape",icon:"📼",description:"A Neon Clover cassette with SIDE B labelled ROOM 01.",sourceRoom:"arcade",useIn:"nostalgia"});
    if(id==="planet")addItem({id:"glass-planet-charm",name:"Glass Planet Charm",icon:"🪐",description:"A tiny blue glass planet from the prize counter.",sourceRoom:"arcade",useIn:"observatory"});
    setToast(`${p[1]} ${p[2]} redeemed.`);
  }
  function claimFragment(){if(save.claimedFragment||!save.secretBooted||save.tickets<100)return; addItem({id:"pixel-fragment",name:"Pixel Fragment",icon:"◈",description:"A translucent shard flickering magenta, cyan and gold.",sourceRoom:"arcade",useIn:"dream"}); completeQuest("arcade-after-hours"); discoverClue("arcade-pixel-fragment"); update(s=>({...s,tickets:s.tickets-100,claimedFragment:true})); setToast("PIXEL FRAGMENT recovered · PLAYER ONE SAVED.");}
  function tasteFood(id:string,icon:string,name:string,note:string){update(s=>({...s,foodTried:s.foodTried.includes(id)?s.foodTried:[...s.foodTried,id]}));setToast(`${icon} ${name} · ${note}`);}

  return <main className={`arcade-room arcade-zone-${zone} ${marqueeOn ? "is-lit" : "is-dim"}`}>
    <div className="arcade-grain"/><div className="arcade-neon-haze"/>
    <header className="arcade-header">
      <button className="arcade-back" onClick={returnToHub}>← hallway</button>
      <div className="arcade-header-title"><p>{zoneInfo.eyebrow} · AFTER HOURS</p><h1>Neon Clover · {zoneInfo.title}</h1><span>{zoneInfo.subtitle}</span></div>
      <div className="arcade-wallet"><button onClick={()=>setModal("token")}><b>{save.tokens}</b> TOKENS</button><button onClick={()=>setModal("prizes")}><b>{save.tickets}</b> TICKETS</button></div>
    </header>

    <section className="arcade-scene">
      <div className="arcade-ceiling"><i/><i/><i/><i/><i/><i/><i/></div>
      <button className="arcade-zone-arrow arcade-zone-arrow-left" onClick={()=>moveZone(-1)}><b>‹</b><span>{ZONES[((zone+2)%3) as Zone].title}</span></button>
      <button className="arcade-zone-arrow arcade-zone-arrow-right" onClick={()=>moveZone(1)}><span>{ZONES[((zone+1)%3) as Zone].title}</span><b>›</b></button>
      <div className="arcade-room-tabs">{ZONES.map((z,i)=><button key={z.title} className={zone===i?"is-active":""} onClick={()=>setZone(i as Zone)} />)}</div>

      {zone===0 && <div className="arcade-zone-content arcade-main-floor">
        <button className="arcade-neon-sign" onClick={()=>setMarqueeOn(v=>!v)}><small>WELCOME TO</small><strong>NEON CLOVER</strong><span>ARCADE · GAMES · PRIZES</span></button>
        <button className="arcade-scoreboard" onClick={()=>setModal("scores")}><small>LOCAL HIGH SCORES</small><strong>{uniqueWins}/5 GAMES CLEARED</strong><span>tap to inspect</span></button>
        <div className="arcade-left-bank"><Cabinet title="QUICKDRAW" subtitle="FREE · REACTION" accent="pink" icon="⚡" cost="FREE" onClick={()=>setModal("reaction")}/><Cabinet title="LUCKY 7" subtitle="TICKET SLOTS" accent="gold" icon="7" cost="1" onClick={()=>setModal("slots")}/><Cabinet title="TWENTY ONE" subtitle="CARD TABLE" accent="cyan" icon="♠" cost="2" onClick={()=>setModal("twentyone")}/></div>
        <div className="arcade-right-bank"><Cabinet title="STAR CHASER" subtitle={hasStarFragment?"SKY LINK READY":"SIGNAL LOST"} accent="blue" icon="✦" cost="LINK" onClick={starCabinet}/><Cabinet title="OUT OF ORDER" subtitle={secretAvailable?"...BOOT?":`${uniqueWins}/5 CLEARS`} accent="glitch" icon="?" cost="???" onClick={bootSecret}/><Cabinet title="GHOST SAVE" subtitle="NO CONTROLLER" accent="violet" icon="◌" cost="OFF" onClick={()=>setToast("PLAYER TWO: ROOM_05 · CONTROLLER NOT FOUND.")}/></div>
      </div>}

      {zone===1 && <div className="arcade-zone-content arcade-midway-floor">
        <div className="arcade-zone-sign"><small>CARNIVAL WING</small><strong>THE MIDWAY</strong><span>games of skill · suspiciously generous tickets</span></div>
        <div className="arcade-midway-games"><GameCard icon="🏀" name="HOOP FEVER" note="five shots" cost="1 TOKEN" onClick={()=>setModal("basketball")}/><GameCard icon="🤡" name="HIT THE CLOWN" note="10 second bonkfest" cost="FREE" onClick={()=>setModal("clown")}/><GameCard icon="🔴" name="BEANBAG BONANZA" note="three throws" cost="1 TOKEN" onClick={()=>setModal("beanbag")}/><GameCard icon="🕹️" name="LUCKY CLAW" note="toys · books · figurines" cost="2 TOKENS" onClick={()=>setModal("claw")}/></div>
        <button className="arcade-claw-shelf-preview" onClick={()=>setModal("collection")}><small>PRIZE SHELF</small><div>🧸 · 🐇 · 🔭 · 🐈 · 📘 · 🤖</div><strong>{save.collectibles.length}/6 COLLECTED</strong></button>
      </div>}

      {zone===2 && <div className="arcade-zone-content arcade-jackpot-floor">
        <div className="arcade-zone-sign arcade-jackpot-sign"><small>FICTIONAL TOKENS ONLY</small><strong>JACKPOT LOUNGE</strong><span>high-ticket games · very real bragging rights</span></div>
        <div className="arcade-jackpot-tables"><CasinoCard icon="🎡" name="LUCKY WHEEL" note="up to 75 tickets" cost="2 TOKENS" onClick={()=>setModal("wheel")}/><CasinoCard icon="🂡" name="HIGH / LOW" note="quick ticket table" cost="1 TOKEN" onClick={()=>setModal("highlow")}/><CasinoCard icon="🎲" name="DICE DUEL" note="7 · doubles · twelve" cost="2 TOKENS" onClick={()=>setModal("dice")}/><CasinoCard icon="★★★" name="TRIPLE STAR" note="120-ticket jackpot" cost="3 TOKENS" onClick={()=>setModal("triplestar")}/></div>
        <button className="arcade-vip-booth" onClick={()=>setToast("VIP receipt: DEPARTURE 11:47 · PLATFORM 7.")}><span>VIP 07</span><strong>TABLE RESERVED</strong><small>receipt tucked beneath the glass...</small></button>
      </div>}

      <button className="arcade-token-machine" onClick={()=>setModal("token")}><i/><strong>TOKENS</strong><span>PLAYER CARD</span><em>◎</em></button>
      <button className="arcade-prize-counter" onClick={()=>setModal("prizes")}><span className="prize-sign">PRIZE EXCHANGE</span><div className="prize-shelf">🧸 👾 🌙 🪩 🌱 ⭐ 🪐 📼</div><strong>{save.tickets} tickets available</strong></button>
      <button className="arcade-snack-bar" onClick={()=>setModal("food")}><span>PIXEL BITES</span><div>🍟 🥤 🍿 🥨 🧀 🥛</div><small>fuel for irresponsible high scores</small></button>
      <aside className="arcade-progress-board"><small>AFTER-HOURS CHALLENGE</small><strong>{secretAvailable?"SECRET CABINET READY":"CLEAR FIVE DIFFERENT GAMES"}</strong><div className="arcade-progress-pips">{[0,1,2,3,4].map(n=><i key={n} className={n<uniqueWins?"is-on":""}/>)}</div><span>{save.claimedFragment?"◈ PLAYER ONE SAVED":save.secretBooted?"100 tickets unlock the fragment":`${uniqueWins}/5 unique clears`}</span></aside>
      <p className="arcade-floor-toast">{toast}</p>
    </section>

    {modal && <div className="arcade-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className={`arcade-modal arcade-modal-${modal}`}><button className="arcade-modal-close" onClick={()=>setModal(null)}>×</button>
      {modal==="token" && <><Heading eyebrow="TOKEN COUNTER" title="Keep Playing" text="Refill fictional arcade tokens without getting stuck."/><div className="arcade-token-options"><TokenOption icon="🎟️" title="Welcome Roll" text={save.welcomeClaimed?"already claimed":"+8 tokens · one time"} disabled={save.welcomeClaimed} onClick={claimWelcome}/><TokenOption icon="🪪" title="Player Card Stamp" text={`every 4 paid rounds → +3 tokens · ${save.paidPlays%4}/4`} disabled={Math.floor(save.paidPlays/4)<=save.tokenStamp} onClick={claimStamp}/><TokenOption icon="🔁" title="Ticket Exchange" text="15 tickets → 4 tokens" disabled={save.tickets<15} onClick={tradeTickets}/><TokenOption icon="🆘" title="Emergency Free Play" text="0 tokens → +3" disabled={save.tokens>0} onClick={emergency}/></div><p className="arcade-ticket-balance">{save.tokens} TOKENS · {save.tickets} TICKETS</p></>}
      {modal==="reaction" && <><Heading eyebrow="MAIN FLOOR · FREE" title="Quickdraw Lights" text="Wait for green, then hit it."/><button className={`arcade-reaction-pad is-${reactionState}`} disabled={["idle","done","too-early"].includes(reactionState)} onClick={hitReaction}>{reactionState==="waiting"?"WAIT...":reactionState==="ready"?"HIT!":reactionState==="done"?`${reactionMs} ms`:reactionState==="too-early"?"TOO EARLY":"READY?"}</button><button className="arcade-primary-button" onClick={startReaction}>START · FREE</button></>}
      {modal==="slots" && <><Heading eyebrow="MAIN FLOOR · 1 TOKEN" title="Lucky 7" text="Ticket slots using fictional arcade tokens only."/><div className="arcade-slot-reels">{reels.map((r,i)=><span key={i}>{r}</span>)}</div><p className="arcade-game-message">{slotMessage}</p><button className="arcade-primary-button" onClick={spinSlots} disabled={spinning}>SPIN · 1 TOKEN</button></>}
      {modal==="twentyone" && <><Heading eyebrow="MAIN FLOOR · 2 TOKENS" title="Twenty One" text="Get close to 21 without going over."/><div className="arcade-card-row">{cards.map((c,i)=><span key={i}>{c}</span>)}</div><strong className="arcade-total">TOTAL · {total21}</strong><p className="arcade-game-message">{twentyOneMessage}</p>{!twentyOneActive?<button className="arcade-primary-button" onClick={start21}>NEW HAND · 2 TOKENS</button>:<div className="arcade-button-row"><button onClick={hit21}>HIT</button><button onClick={()=>finish21()}>STAND</button></div>}</>}
      {modal==="basketball" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Hoop Fever" text="Five shots. Three baskets clears the machine."/><div className="arcade-hoop">🏀 <span>▱</span></div><div className="arcade-shot-dots">{[0,1,2,3,4].map(n=><i key={n} className={basketShots[n]===1?"made":basketShots[n]===0?"miss":""}/>)}</div><p className="arcade-game-message">{basketMessage}</p>{basketShots.length===0||basketShots.length===5?<button className="arcade-primary-button" onClick={startBasketball}>{basketShots.length===5?"PLAY AGAIN":"START"} · 1 TOKEN</button>:<button className="arcade-primary-button" onClick={basketShoot}>SHOOT!</button>}</>}
      {modal==="clown" && <><Heading eyebrow="MIDWAY · FREE" title="Hit the Clown" text="Bonk the lit clown. Five hits clears it."/><div className="arcade-clown-grid">{[0,1,2,3,4,5,6,7,8].map(n=><button key={n} className={clownActive&&clownTarget===n?"is-target":""} onClick={()=>whack(n)}>{clownActive&&clownTarget===n?"🤡":"○"}</button>)}</div><p className="arcade-game-message">{clownHits} HITS · {clownTime}s</p><button className="arcade-primary-button" onClick={startClown} disabled={clownActive}>START · FREE</button></>}
      {modal==="beanbag" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Beanbag Bonanza" text="Three throws. Higher holes score more."/><div className="arcade-beanbag-board">{[3,5,8,10].map(p=><button key={p} disabled={beanbagThrows<=0} onClick={()=>throwBeanbag(p)}><span>{p}</span><small>PTS</small></button>)}</div><p className="arcade-game-message">SCORE {beanbagScore} · THROWS {beanbagThrows}</p><button className="arcade-primary-button" onClick={startBeanbag}>NEW ROUND · 1 TOKEN</button></>}
      {modal==="claw" && <><Heading eyebrow="CLAW ALLEY · 2 TOKENS" title="Lucky Claw" text="Collect toys, books and figurines that can later appear on shelves in other rooms."/><div className="arcade-claw-machine"><div className="arcade-claw-rail"><span style={{left:`${clawPosition}%`}}>⌄</span></div><div className="arcade-claw-pile">🧸 🐇 🔭 🐈 📘 🤖</div></div><input className="arcade-claw-slider" type="range" min="5" max="95" value={clawPosition} onChange={e=>setClawPosition(Number(e.target.value))}/><p className="arcade-game-message">{clawMessage}</p><button className="arcade-primary-button" onClick={dropClaw}>DROP CLAW · 2 TOKENS</button></>}
      {modal==="wheel" && <><Heading eyebrow="JACKPOT · 2 TOKENS" title="Lucky Wheel" text="Small chance, chunky ticket payouts."/><div className="arcade-wheel">{wheelValue??"✦"}<small>TICKETS</small></div><button className="arcade-primary-button" onClick={spinWheel}>SPIN · 2 TOKENS</button></>}
      {modal==="highlow" && <><Heading eyebrow="JACKPOT · 1 TOKEN" title="Higher / Lower" text="Guess whether the next card is higher or lower."/><div className="arcade-highlow-card">{highLowCard}</div><p className="arcade-game-message">{highLowMessage}</p><div className="arcade-button-row"><button onClick={()=>guessHighLow("low")}>LOWER · 1</button><button onClick={()=>guessHighLow("high")}>HIGHER · 1</button></div></>}
      {modal==="dice" && <><Heading eyebrow="JACKPOT · 2 TOKENS" title="Dice Duel" text="Seven, doubles and twelve pay extra."/><div className="arcade-dice-row"><span>{dice[0]}</span><span>{dice[1]}</span></div><button className="arcade-primary-button" onClick={rollDice}>ROLL · 2 TOKENS</button></>}
      {modal==="triplestar" && <><Heading eyebrow="VIP JACKPOT · 3 TOKENS" title="Triple Star" text="Two stars pay 45 tickets. Three stars pay 120."/><div className="arcade-triple-row">{triple.map((v,i)=><span key={i}>{v}</span>)}</div><button className="arcade-primary-button" onClick={playTriple}>PLAY · 3 TOKENS</button></>}
      {modal==="food" && <><Heading eyebrow="PIXEL BITES" title="Snack Counter" text="Questionable food is required arcade infrastructure."/><div className="arcade-food-grid">{FOOD.map(([id,icon,name,note])=><button key={id} onClick={()=>tasteFood(id,icon,name,note)}><span>{icon}</span><strong>{name}</strong><small>{save.foodTried.includes(id)?"tried ✓":"taste"}</small></button>)}</div></>}
      {modal==="collection" && <><Heading eyebrow="CLAW ALLEY" title="Your Arcade Collection" text="These finds can later physically appear on shelves in Nostalgia, Observatory or Dream."/><div className="arcade-collection-shelf">{CLAW_TOYS.map(t=>{const owned=save.collectibles.includes(t.id);return <div key={t.id} className={owned?"is-owned":"is-empty"}><span>{owned?t.icon:"?"}</span><strong>{owned?t.name:"empty shelf"}</strong><small>{owned?t.note:"win it from the claw"}</small></div>})}</div></>}
      {modal==="prizes" && <><Heading eyebrow="PRIZE EXCHANGE" title="Spend Your Tickets" text="Cheap nonsense, collectibles and cross-room items."/><div className="arcade-prize-grid arcade-prize-grid-large">{PRIZES.map(([id,icon,name,cost,note])=>{const claimed=save.purchasedPrizes.includes(id);return <PrizeCard key={id} icon={icon} name={name} cost={claimed?"CLAIMED":String(cost)} note={note} disabled={claimed||save.tickets<cost} onClick={()=>buyPrize(id,cost)}/>})}<PrizeCard icon="◈" name="Pixel Fragment" cost={save.claimedFragment?"RECOVERED":"100"} note={save.secretBooted?"after-hours grand prize":"case sealed · find the broken cabinet"} disabled={save.claimedFragment||!save.secretBooted||save.tickets<100} onClick={claimFragment} special/></div><p className="arcade-ticket-balance">AVAILABLE · {save.tickets} TICKETS</p></>}
      {modal==="scores" && <><Heading eyebrow="PLAYER ONE" title="High Score Archive" text="Five different clears wake the OUT OF ORDER cabinet."/><div className="arcade-score-list">{scoreRows.map(([name,id])=><div key={id}><span>{name}</span><strong>{save.highScores[id]??"---"}</strong></div>)}</div><p className="arcade-modal-copy">DIFFERENT GAMES CLEARED · <b>{uniqueWins}/5</b></p></>}
      {modal==="secret" && <><Heading eyebrow="OUT OF ORDER · SERVICE MODE" title="CORRUPTED SAVE FOUND" text="The dead cabinet has a user profile instead of a game."/><div className="arcade-secret-terminal"><p>&gt; USER ........ PLAYER_ONE</p><p>&gt; ORIGIN ...... NOSTALGIA_01</p><p>&gt; DATE ........ 04/17</p><p>&gt; DEPARTURE ... 11:47 / P7</p><p>&gt; SKY_CHECK ... {hasStarFragment?"FRAGMENT PRESENT":"NO RESPONSE"}</p><p>&gt; MIDWAY ...... PRIZE MEMORY ENABLED</p><p className="is-glitch">&gt; ROOM_05 .... PLAYER TWO WAITING</p></div><div className="arcade-secret-disk"><span>▣</span><div><strong>RETRO SYSTEM DISK</strong><small>NOSTALGIA_01 · unknown save format</small></div><button onClick={takeDisk} disabled={save.claimedDisk}>{save.claimedDisk?"TAKEN":"TAKE DISK"}</button></div></>}
    </section></div>}
  </main>;
}

function Cabinet({title,subtitle,accent,icon,cost,onClick}:{title:string;subtitle:string;accent:string;icon:string;cost:string;onClick:()=>void}){return <button className={`arcade-cabinet accent-${accent}`} onClick={onClick}><span className="cabinet-marquee">{title}</span><span className="cabinet-screen"><i>{icon}</i><small>{subtitle}</small></span><span className="cabinet-controls"><i/><i/><b/></span><span className="cabinet-coin">● {cost==="FREE"?"FREE PLAY":cost}</span></button>}
function GameCard({icon,name,note,cost,onClick}:{icon:string;name:string;note:string;cost:string;onClick:()=>void}){return <button className="arcade-midway-game" onClick={onClick}><span>{icon}</span><strong>{name}</strong><small>{note}</small><b>{cost}</b></button>}
function CasinoCard({icon,name,note,cost,onClick}:{icon:string;name:string;note:string;cost:string;onClick:()=>void}){return <button className="arcade-casino-game" onClick={onClick}><span>{icon}</span><div><strong>{name}</strong><small>{note}</small></div><b>{cost}</b></button>}
function Heading({eyebrow,title,text}:{eyebrow:string;title:string;text:string}){return <header className="arcade-modal-heading"><small>{eyebrow}</small><h2>{title}</h2><p>{text}</p></header>}
function TokenOption({icon,title,text,disabled,onClick}:{icon:string;title:string;text:string;disabled:boolean;onClick:()=>void}){return <button className="arcade-token-option" disabled={disabled} onClick={onClick}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div></button>}
function PrizeCard({icon,name,cost,note,disabled,onClick,special=false}:{icon:string;name:string;cost:string;note:string;disabled:boolean;onClick:()=>void;special?:boolean}){return <button className={`arcade-prize-card ${special?"is-special":""}`} disabled={disabled} onClick={onClick}><span>{icon}</span><strong>{name}</strong><small>{note}</small><b>{cost}{/^\d+$/.test(cost)?" TICKETS":""}</b></button>}

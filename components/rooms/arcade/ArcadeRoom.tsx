"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type Zone = 0 | 1 | 2;
type Modal = null | "token" | "prizes" | "collection" | "food" | "scores" | "reaction" | "slots" | "twentyone" | "memory" | "rhythm" | "basketball" | "clown" | "beanbag" | "claw" | "skeeball" | "ringtoss" | "wheel" | "highlow" | "dice" | "triplestar" | "poker" | "colorbet" | "pixelracer" | "bottlebash" | "vaultpick" | "secret" | "reset";
type ReactionState = "idle" | "waiting" | "ready" | "done" | "too-early";
type CollectibleId = "pixel-bear" | "moon-bunny" | "tiny-astronomer" | "ghost-cat" | "pocket-atlas" | "crt-robot";

type ArcadeSave = {
  tokens: number;
  tickets: number;
  welcomeClaimed: boolean;
  tokenStamp: number;
  coinReturnStamp: number;
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

const STORAGE_KEY = "arcade-v4-progress";
const DEFAULT_SAVE: ArcadeSave = {
  tokens: 6,
  tickets: 0,
  welcomeClaimed: false,
  tokenStamp: 0,
  coinReturnStamp: 0,
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
  ["stickers","✨","Holographic Sticker Pack",6,"tiny cabinet decals"],
  ["candy","🍬","Mystery Candy Tube",10,"probably edible"],
  ["alien","👾","Glow Alien",16,"decorative · adorable · zero lore"],
  ["keychain","🕹️","Mini Joystick Keychain",22,"clicks satisfyingly"],
  ["dice-set","🎲","Pocket Dice Set",26,"tiny translucent dice"],
  ["poster","🖼️","Neon Clover Poster",30,"future Nostalgia wall collectible"],
  ["seed","🌱","Moonflower Seeds",34,"future Greenhouse item"],
  ["cassette","📼","Blank Arcade Mixtape",38,"future Nostalgia item"],
  ["train-pin","🚉","Platform Seven Pin",42,"P7 · 11:47 stamped on the back"],
  ["mirror","◌","Mirror Token",46,"future Dream Room item"],
  ["planet","🪐","Glass Planet Charm",52,"Observatory shelf collectible"],
  ["crt-lamp","💻","Tiny CRT Night Light",58,"future Nostalgia shelf item"],
  ["clover-plush","☘️","Clover Plush",64,"soft · green · judgmental"],
  ["music-box","🎵","8-Bit Music Box",72,"plays four suspicious notes"],
  ["dream-lantern","🏮","Dream Lantern",82,"future Dream Room decoration"],
  ["star-globe","🌌","Pocket Star Globe",90,"future Observatory decoration"],
  ["fortune-card","🃏","Fortune Card Deck",32,"glittery cards with impossible suits"],
  ["mini-basket","🏀","Mini Hoop Set",36,"desk-sized and dangerously competitive"],
  ["clown-pin","🤡","Midway Clown Pin",44,"it looks happier upside down"],
  ["beanbag-set","🔴","Tiny Beanbag Set",48,"three miniature stitched beanbags"],
  ["lucky-bell","🔔","Lucky Counter Bell",56,"rings by itself at 11:47"],
  ["ticket-crown","👑","Ticket Crown",68,"ridiculous, shiny, absolutely necessary"],
  ["arcade-book","📕","Arcade Secrets Book",76,"half strategy guide, half room gossip"],
  ["neon-clock","🕚","Neon 11:47 Clock",88,"future Train / Nostalgia decoration"],
  ["mystery-box","🎁","Mystery Prize Box",96,"sealed with a tiny clover sticker"],
  ["giant-plush","🧸","Giant Arcade Bear",105,"objectively too large"],
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
  const [memorySeq,setMemorySeq]=useState<number[]>([]); const [memoryInput,setMemoryInput]=useState<number[]>([]); const [memoryMessage,setMemoryMessage]=useState("watch five lamps, then repeat them"); const [memoryLocked,setMemoryLocked]=useState(false);
  const [rhythmPos,setRhythmPos]=useState(5); const [rhythmTarget,setRhythmTarget]=useState(50); const [rhythmHits,setRhythmHits]=useState(0); const [rhythmActive,setRhythmActive]=useState(false); const rhythmTimer=useRef<ReturnType<typeof setInterval>|null>(null);
  const [skeeBalls,setSkeeBalls]=useState(0); const [skeeScore,setSkeeScore]=useState(0); const [ringThrows,setRingThrows]=useState(0); const [ringScore,setRingScore]=useState(0);
  const [pokerHand,setPokerHand]=useState(["A♠","7♥","K♣","4♦","9♠"]); const [pokerMessage,setPokerMessage]=useState("five-card draw"); const [colorResult,setColorResult]=useState<string>("?");
  const [racerLane,setRacerLane]=useState(1); const [racerRound,setRacerRound]=useState(0); const [racerScore,setRacerScore]=useState(0); const [racerHazard,setRacerHazard]=useState<number|null>(null); const [racerActive,setRacerActive]=useState(false); const [racerMessage,setRacerMessage]=useState("pick a lane, dodge six hazards");
  const [bottleThrows,setBottleThrows]=useState(0); const [bottlesLeft,setBottlesLeft]=useState(10); const [bottleMessage,setBottleMessage]=useState("three throws · choose your power");
  const [vaultRound,setVaultRound]=useState(0); const [vaultMessage,setVaultMessage]=useState("choose one vault door"); const [vaultOpened,setVaultOpened]=useState<number|null>(null);

  const hasStarFragment = hasItem("star-fragment");
  const uniqueWins = new Set(save.wins).size;
  const secretAvailable = uniqueWins >= 7;
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
    if (rhythmTimer.current) clearInterval(rhythmTimer.current);
  }, []);

  const scoreRows = useMemo(() => [
    ["QUICKDRAW", "reaction"], ["LUCKY 7", "slots"], ["TWENTY ONE", "twentyone"], ["MEMORY MATRIX", "memory"], ["RHYTHM RUSH", "rhythm"], ["PIXEL RACER", "pixelracer"],
    ["HOOP FEVER", "basketball"], ["HIT THE CLOWN", "clown"], ["BEANBAG", "beanbag"], ["SKEE BALL", "skeeball"], ["RING TOSS", "ringtoss"], ["BOTTLE BASH", "bottlebash"],
    ["LUCKY WHEEL", "wheel"], ["HIGH / LOW", "highlow"], ["DICE DUEL", "dice"], ["TRIPLE STAR", "triplestar"], ["POKER DRAW", "poker"], ["COLOR BET", "colorbet"], ["VAULT PICK", "vaultpick"],
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
    update(s => ({ ...s, tokens: s.tokens + 5, welcomeClaimed: true }));
    setToast("five fresh NEON CLOVER tokens clatter into the tray.");
  }
  function claimStamp() {
    const stamps = Math.floor(save.paidPlays / 5);
    if (stamps <= save.tokenStamp) { setToast("play four paid rounds to earn the next refill."); return; }
    const due = stamps - save.tokenStamp;
    update(s => ({ ...s, tokens: s.tokens + due * 2, tokenStamp: stamps }));
    setToast(`PLAYER CARD stamped · +${due * 2} tokens.`);
  }
  function claimCoinReturn() {
    const returns = Math.floor(save.paidPlays / 3);

    if (returns <= save.coinReturnStamp) {
      const progress = save.paidPlays % 3;
      const remaining = progress === 0 ? 3 : 3 - progress;
      setToast(`coin return is empty · ${remaining} more paid round${remaining === 1 ? "" : "s"} until it rattles again.`);
      return;
    }

    const due = returns - save.coinReturnStamp;
    update(s => ({
      ...s,
      tokens: s.tokens + due,
      coinReturnStamp: returns,
    }));

    setToast(`you check the old coin-return tray · +${due} token${due === 1 ? "" : "s"}.`);
  }

  function tradeTickets() {
    if (save.tickets < 20) return;
    update(s => ({ ...s, tickets: s.tickets - 20, tokens: s.tokens + 3 }));
    setToast("20 tickets exchanged for 3 tokens.");
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
    const payout = ms <= 240 ? 12 : ms <= 330 ? 8 : ms <= 420 ? 5 : 2;
    setReactionMs(ms); setReactionState("done"); awardTickets(payout); highScore("reaction", clamp(650 - ms, 50, 550)); if (ms <= 420) markWin("quickdraw");
  }
  function spinSlots() {
    if (spinning || !spend(1)) return;
    setSpinning(true); setSlotMessage("reels rattling...");
    setTimeout(() => {
      const next = [0,1,2].map(() => SLOT_SYMBOLS[rand(0, SLOT_SYMBOLS.length - 1)]); setReels(next);
      const same3 = next.every(v => v === next[0]); const same2 = next[0] === next[1] || next[1] === next[2] || next[0] === next[2]; const sevens = next.filter(v => v === "7").length;
      let payout = 1; if (same3 && next[0] === "7") payout = 40; else if (same3) payout = 22; else if (sevens >= 2) payout = 14; else if (same2) payout = 8;
      awardTickets(payout); highScore("slots", payout); if (payout >= 8) markWin("lucky-seven"); setSlotMessage(`${payout} TICKETS`); setSpinning(false);
    }, 650);
  }
  function start21() { if (!spend(2)) return; setCards([rand(2,10), rand(2,10)]); setTwentyOneActive(true); setTwentyOneMessage("hit or stand"); }
  function finish21(finalCards = cards) {
    const total = finalCards.reduce((a,b) => a+b,0); setTwentyOneActive(false);
    let payout = total === 21 ? 18 : total === 20 ? 12 : total === 19 ? 9 : total >= 17 && total <= 21 ? 6 : total > 21 ? 0 : 2;
    awardTickets(payout); highScore("twentyone", total <= 21 ? total : 0); if (total >= 17 && total <= 21) markWin("twenty-one"); setTwentyOneMessage(`${total > 21 ? "BUST · " : ""}${total} · ${payout} tickets`);
  }
  function hit21() { if (!twentyOneActive) return; const next = [...cards, rand(1,10)]; setCards(next); if (next.reduce((a,b)=>a+b,0) >= 21) finish21(next); }

  function startBasketball() { if (!spend(1)) return; setBasketShots([]); setBasketMessage("tap SHOOT five times"); }
  function basketShoot() {
    if (basketShots.length >= 5) return;
    const next = [...basketShots, Math.random() > .37 ? 1 : 0]; setBasketShots(next);
    if (next.length === 5) { const baskets = next.reduce((a,b)=>a+b,0); const payout = baskets * 3 + (baskets === 5 ? 8 : 0); awardTickets(payout); highScore("basketball", baskets); if (baskets >= 3) markWin("basketball"); setBasketMessage(`${baskets}/5 baskets · ${payout} tickets`); }
  }
  function startClown() {
    if (clownActive) return; if (clownTimer.current) clearInterval(clownTimer.current); setClownHits(0); setClownTime(10); setClownTarget(rand(0,8)); setClownActive(true);
    let time = 10; clownTimer.current = setInterval(() => { time--; setClownTime(time); setClownTarget(rand(0,8)); if (time <= 0) { if (clownTimer.current) clearInterval(clownTimer.current); setClownActive(false); } }, 1000);
  }
  function whack(index: number) { if (!clownActive || index !== clownTarget) return; const hits = clownHits + 1; setClownHits(hits); setClownTarget(rand(0,8)); if (hits === 5) { awardTickets(12, "five clowns bonked · 12 tickets."); markWin("hit-the-clown"); } else if (hits > 5) awardTickets(1); highScore("clown", hits); }
  function startBeanbag() { if (!spend(1)) return; setBeanbagScore(0); setBeanbagThrows(3); }
  function throwBeanbag(points: number) { if (beanbagThrows <= 0) return; const score = beanbagScore + points; const left = beanbagThrows - 1; setBeanbagScore(score); setBeanbagThrows(left); if (left === 0) { const payout = Math.max(2, Math.ceil(score / 2)); awardTickets(payout); highScore("beanbag", score); if (score >= 18) markWin("beanbag"); } }
  function dropClaw() {
    if (!spend(2)) return;
    const success = Math.random() > .42;
    if (!success) { setClawMessage("the claw slips dramatically · no prize this time"); return; }
    const available = CLAW_TOYS.filter(t => !save.collectibles.includes(t.id)); const toy = available.length ? available[rand(0, available.length - 1)] : CLAW_TOYS[rand(0, CLAW_TOYS.length - 1)];
    if (save.collectibles.includes(toy.id)) { awardTickets(6); setClawMessage("duplicate toy traded automatically for 6 tickets"); return; }
    update(s => ({ ...s, collectibles: [...s.collectibles, toy.id] }));
    addItem({ id: `arcade-${toy.id}`, name: toy.name, icon: toy.icon, description: `${toy.note}. Won from Neon Clover's claw alley.`, sourceRoom: "arcade", ...(toy.useIn ? { useIn: toy.useIn } : {}) });
    markWin("claw-alley"); setClawMessage(`GOT IT · ${toy.icon} ${toy.name}`);
  }

  function spinWheel() { if (!spend(2)) return; const options = [0,2,4,6,10,16,25]; const payout = options[rand(0,options.length-1)]; setWheelValue(payout); awardTickets(payout); highScore("wheel", payout); if (payout >= 10) markWin("lucky-wheel"); }
  function guessHighLow(dir: "high" | "low") { if (!spend(1)) return; const next = rand(1,13); const correct = dir === "high" ? next > highLowCard : next < highLowCard; const equal = next === highLowCard; const payout = equal ? 2 : correct ? 7 : 0; awardTickets(payout); setHighLowMessage(`${highLowCard} → ${next} · ${correct ? "CORRECT" : equal ? "PUSH" : "MISS"} · ${payout} tickets`); if (correct) { markWin("high-low"); highScore("highlow", 7); } setHighLowCard(next); }
  function rollDice() { if (!spend(2)) return; const next: [number, number] = [rand(1,6),rand(1,6)]; setDice(next); const sum = next[0]+next[1]; let payout = 0; if (next[0]===next[1]) payout=12; if(sum===7)payout=10; if(sum===12)payout=22; awardTickets(payout); highScore("dice",payout); if(payout>=10)markWin("dice-duel"); }
  function playTriple() { if(!spend(3))return; const symbols=["★","☾","◆","♣"]; const next=[0,1,2].map(()=>symbols[rand(0,symbols.length-1)]); setTriple(next); const stars=next.filter(x=>x==="★").length; const same=next.every(x=>x===next[0]); let payout=1; if(same&&next[0]==="★")payout=45; else if(same)payout=22; else if(stars===2)payout=16; else if(stars===1)payout=5; awardTickets(payout); highScore("triplestar",payout); if(payout>=16)markWin("triple-star"); }

  function startMemory(){if(!spend(1))return;const seq=Array.from({length:5},()=>rand(0,3));setMemorySeq(seq);setMemoryInput([]);setMemoryLocked(true);setMemoryMessage(`memorise: ${seq.map(n=>["PINK","CYAN","GOLD","GREEN"][n]).join(" · ")}`);setTimeout(()=>{setMemoryLocked(false);setMemoryMessage("repeat the five lamps")},1700)}
  function pressMemory(i:number){if(memoryLocked||!memorySeq.length)return;const next=[...memoryInput,i];setMemoryInput(next);if(memorySeq[next.length-1]!==i){setMemoryMessage("wrong lamp · sequence lost");setMemorySeq([]);return}if(next.length===memorySeq.length){awardTickets(10);highScore("memory",5);markWin("memory-matrix");setMemoryMessage("PERFECT · 10 tickets");setMemorySeq([])}}
  function startRhythm(){if(!spend(1))return;if(rhythmTimer.current)clearInterval(rhythmTimer.current);setRhythmHits(0);setRhythmPos(5);setRhythmTarget(rand(25,75));setRhythmActive(true);let pos=5,dir=1;rhythmTimer.current=setInterval(()=>{pos+=dir*5;if(pos>=95){pos=95;dir=-1}if(pos<=5){pos=5;dir=1}setRhythmPos(pos)},75)}
  function hitRhythm(){if(!rhythmActive)return;if(Math.abs(rhythmPos-rhythmTarget)<=12){const h=rhythmHits+1;setRhythmHits(h);setRhythmTarget(rand(25,75));if(h>=4){if(rhythmTimer.current)clearInterval(rhythmTimer.current);setRhythmActive(false);awardTickets(9);highScore("rhythm",4);markWin("rhythm-rush")}}else setRhythmHits(Math.max(0,rhythmHits-1))}
  function startSkee(){if(!spend(2))return;setSkeeBalls(5);setSkeeScore(0)}
  function rollSkee(risk:1|2|3){if(skeeBalls<=0)return;const r=Math.random();const pts=risk===1?(r<.8?10:20):risk===2?(r<.55?20:r<.85?30:0):(r<.3?50:r<.5?30:0);const score=skeeScore+pts,left=skeeBalls-1;setSkeeScore(score);setSkeeBalls(left);if(left===0){const pay=Math.min(18,Math.floor(score/10));awardTickets(pay);highScore("skeeball",score);if(score>=100)markWin("skee-ball")}}
  function startRings(){if(!spend(1))return;setRingThrows(5);setRingScore(0)}
  function throwRing(d:1|2|3){if(ringThrows<=0)return;const chance=d===1?.72:d===2?.45:.25;const score=ringScore+(Math.random()<chance?d*3:0),left=ringThrows-1;setRingScore(score);setRingThrows(left);if(left===0){awardTickets(Math.min(14,score));highScore("ringtoss",score);if(score>=9)markWin("ring-toss")}}
  function playPoker(){if(!spend(3))return;const ranks=["A","K","Q","J","10","9","8","7","6","5","4","3","2"],suits=["♠","♥","♦","♣"];const hand=Array.from({length:5},()=>ranks[rand(0,ranks.length-1)]+suits[rand(0,3)]);setPokerHand(hand);const ranksOnly=hand.map(x=>x.slice(0,-1));const counts=Object.values(ranksOnly.reduce<Record<string,number>>((a,r)=>{a[r]=(a[r]??0)+1;return a},{})).sort((a,b)=>b-a);let pay=0,label="HIGH CARD";if(counts[0]>=4){pay=34;label="FOUR OF A KIND"}else if(counts[0]===3&&counts[1]===2){pay=25;label="FULL HOUSE"}else if(counts[0]===3){pay=15;label="THREE OF A KIND"}else if(counts[0]===2&&counts[1]===2){pay=10;label="TWO PAIR"}else if(counts[0]===2){pay=5;label="PAIR"}awardTickets(pay);setPokerMessage(`${label} · ${pay} tickets`);highScore("poker",pay);if(pay>=10)markWin("poker-draw")}
  function colorBet(choice:"red"|"black"|"gold"){if(!spend(2))return;const r=Math.random(),res=r<.46?"red":r<.92?"black":"gold";setColorResult(res);const pay=choice===res?(res==="gold"?28:8):0;awardTickets(pay);highScore("colorbet",pay);if(pay>=8)markWin("color-bet")}
  function startPixelRacer(){if(!spend(1))return;setRacerLane(1);setRacerRound(0);setRacerScore(0);setRacerHazard(null);setRacerActive(true);setRacerMessage("choose LEFT, CENTRE or RIGHT")}
  function driveRacer(lane:0|1|2){if(!racerActive)return;const hazard=rand(0,2);setRacerLane(lane);setRacerHazard(hazard);const safe=lane!==hazard;const round=racerRound+1;const score=racerScore+(safe?1:0);setRacerRound(round);setRacerScore(score);if(!safe)setRacerMessage(`CRASH in lane ${["LEFT","CENTRE","RIGHT"][hazard]} · keep going`);else setRacerMessage(`clean dodge · ${score} safe`);if(round>=6){setRacerActive(false);const pay=score>=6?14:score>=5?9:score>=4?5:1;awardTickets(pay);highScore("pixelracer",score);if(score>=5)markWin("pixel-racer");setRacerMessage(`${score}/6 survived · ${pay} tickets`)}}

  function startBottleBash(){if(!spend(1))return;setBottleThrows(3);setBottlesLeft(10);setBottleMessage("three balls ready")}
  function throwBottleBall(power:1|2|3){if(bottleThrows<=0)return;const sweet=rand(1,3);const knocked=power===sweet?rand(4,6):Math.abs(power-sweet)===1?rand(1,3):0;const left=Math.max(0,bottlesLeft-knocked);const throws=bottleThrows-1;setBottlesLeft(left);setBottleThrows(throws);setBottleMessage(`${knocked} bottles down · ${left} remain`);if(throws===0||left===0){const score=10-left;const pay=left===0?12:score>=7?7:score>=4?3:0;awardTickets(pay);highScore("bottlebash",score);if(score>=7)markWin("bottle-bash");setBottleMessage(`${score}/10 knocked · ${pay} tickets`)}}

  function playVaultPick(choice:number){if(vaultRound===0&&!spend(2))return;if(vaultRound===0)setVaultRound(1);const jackpot=rand(0,8);const silver=(jackpot+rand(1,7))%9;setVaultOpened(choice);let pay=0;if(choice===jackpot)pay=24;else if(choice===silver)pay=10;else if(Math.random()<.35)pay=3;awardTickets(pay);highScore("vaultpick",pay);if(pay>=10)markWin("vault-pick");setVaultMessage(pay===24?"GOLD VAULT · 24 tickets":pay===10?"SILVER VAULT · 10 tickets":pay===3?"loose tickets · 3":"empty vault");setVaultRound(0)}

  function resetArcade(){try{localStorage.removeItem("arcade-v1-progress");localStorage.removeItem("arcade-v3-progress");localStorage.removeItem("arcade-v4-progress")}catch{}window.location.assign(window.location.pathname)}
  function starCabinet() { if(!hasStarFragment){setToast("STAR CHASER: INSERT SOMETHING THAT REMEMBERS THE SKY.");return;} if(save.claimedStarBonus){setToast("stellar signature already saved.");return;} awardTickets(8,"Star Fragment recognised · +8 celestial tickets."); discoverClue("arcade-starlight-recognised"); update(s=>({...s,claimedStarBonus:true})); }
  function bootSecret() { if(!secretAvailable){setToast(`OUT OF ORDER · clear ${7-uniqueWins} more different game${7-uniqueWins===1?"":"s"}.`);return;} setModal("secret"); if(!save.secretBooted){update(s=>({...s,secretBooted:true})); discoverClue("arcade-corrupted-save"); discoverClue("train-platform-seven");} }
  function takeDisk() { if(save.claimedDisk)return; addItem({id:"retro-system-disk",name:"Retro System Disk",icon:"▣",description:"A translucent save disk labelled NOSTALGIA_01. Scratched into the back: 04/17 · P7 · 11:47.",sourceRoom:"arcade",useIn:"nostalgia"}); discoverClue("arcade-nostalgia-disk"); update(s=>({...s,claimedDisk:true})); setToast("Retro System Disk added to Backpack."); }
  function buyPrize(id:string,cost:number) {
    if(save.tickets<cost||save.purchasedPrizes.includes(id))return; const p=PRIZES.find(x=>x[0]===id); if(!p)return;
    update(s=>({...s,tickets:s.tickets-cost,purchasedPrizes:[...s.purchasedPrizes,id]}));
    if(id==="seed")addItem({id:"moonflower-seed-packet",name:"Moonflower Seed Packet",icon:"✿",description:"Arcade prize packet marked: WATER ONLY UNDER FALSE STARLIGHT.",sourceRoom:"arcade",useIn:"greenhouse"});
    if(id==="mirror")addItem({id:"mirror-token",name:"Mirror Token",icon:"◌",description:"A polished arcade token. Your reflection seems half a second late.",sourceRoom:"arcade",useIn:"dream"});
    if(id==="cassette")addItem({id:"arcade-mixtape",name:"Blank Arcade Mixtape",icon:"📼",description:"A Neon Clover cassette with SIDE B labelled ROOM 01.",sourceRoom:"arcade",useIn:"nostalgia"});
    if(id==="planet")addItem({id:"glass-planet-charm",name:"Glass Planet Charm",icon:"🪐",description:"A tiny blue glass planet from the prize counter.",sourceRoom:"arcade",useIn:"observatory"});
    if(id==="train-pin")addItem({id:"platform-seven-pin",name:"Platform Seven Pin",icon:"🚉",description:"A Neon Clover enamel pin stamped P7 · 11:47.",sourceRoom:"arcade",useIn:"train"});
    if(id==="crt-lamp")addItem({id:"tiny-crt-night-light",name:"Tiny CRT Night Light",icon:"💻",description:"A tiny prize-counter CRT lamp with a soft blue screen.",sourceRoom:"arcade",useIn:"nostalgia"});
    if(id==="dream-lantern")addItem({id:"dream-lantern",name:"Dream Lantern",icon:"🏮",description:"Its bulb stays lit even when removed.",sourceRoom:"arcade",useIn:"dream"});
    if(id==="star-globe")addItem({id:"pocket-star-globe",name:"Pocket Star Globe",icon:"🌌",description:"A tiny globe showing several impossible constellations.",sourceRoom:"arcade",useIn:"observatory"});
    if(id==="neon-clock")addItem({id:"neon-1147-clock",name:"Neon 11:47 Clock",icon:"🕚",description:"A tiny neon clock permanently frozen at 11:47.",sourceRoom:"arcade",useIn:"train"});
    if(id==="arcade-book")addItem({id:"arcade-secrets-book",name:"Arcade Secrets Book",icon:"📕",description:"A prize-counter strategy guide with handwritten notes about the other rooms.",sourceRoom:"arcade",useIn:"nostalgia"});
    setToast(`${p[1]} ${p[2]} redeemed.`);
  }
  function claimFragment(){if(save.claimedFragment||!save.secretBooted||save.tickets<120)return; addItem({id:"pixel-fragment",name:"Pixel Fragment",icon:"◈",description:"A translucent shard flickering magenta, cyan and gold.",sourceRoom:"arcade",useIn:"dream"}); completeQuest("arcade-after-hours"); discoverClue("arcade-pixel-fragment"); update(s=>({...s,tickets:s.tickets-120,claimedFragment:true})); setToast("PIXEL FRAGMENT recovered · PLAYER ONE SAVED.");}
  function tasteFood(id:string,icon:string,name:string,note:string){update(s=>({...s,foodTried:s.foodTried.includes(id)?s.foodTried:[...s.foodTried,id]}));setToast(`${icon} ${name} · ${note}`);}

  return <main className={`arcade-room arcade-zone-${zone} ${marqueeOn ? "is-lit" : "is-dim"}`}>
    <div className="arcade-grain"/><div className="arcade-neon-haze"/>
    <header className="arcade-header">
      <button className="arcade-back" onClick={returnToHub}>← hallway</button>
      <div className="arcade-header-title"><p>{zoneInfo.eyebrow} · AFTER HOURS</p><h1>Neon Clover · {zoneInfo.title}</h1><span>{zoneInfo.subtitle}</span></div>
      <div className="arcade-wallet"><button onClick={()=>setModal("token")}><b>{save.tokens}</b> TOKENS</button><button onClick={()=>setModal("prizes")}><b>{save.tickets}</b> TICKETS</button><button className="arcade-reset-header" onClick={()=>setModal("reset")}>↻ FRESH RUN</button></div>
    </header>

    <section className="arcade-scene">
      <div className="arcade-ceiling"><i/><i/><i/><i/><i/><i/><i/></div>
      <button className="arcade-zone-arrow arcade-zone-arrow-left" onClick={()=>moveZone(-1)}><b>‹</b><span>{ZONES[((zone+2)%3) as Zone].title}</span></button>
      <button className="arcade-zone-arrow arcade-zone-arrow-right" onClick={()=>moveZone(1)}><span>{ZONES[((zone+1)%3) as Zone].title}</span><b>›</b></button>
      <div className="arcade-room-tabs">{ZONES.map((z,i)=><button key={z.title} className={zone===i?"is-active":""} onClick={()=>setZone(i as Zone)} />)}</div>

      {zone===0 && <div className="arcade-zone-content arcade-main-floor">
        <button className="arcade-neon-sign" onClick={()=>setMarqueeOn(v=>!v)}><small>WELCOME TO</small><strong>NEON CLOVER</strong><span>ARCADE · GAMES · PRIZES</span></button>
        <button className="arcade-scoreboard" onClick={()=>setModal("scores")}><small>LOCAL HIGH SCORES</small><strong>{uniqueWins}/7 GAMES CLEARED</strong><span>tap to inspect</span></button>
        <div className="arcade-left-bank"><Cabinet title="QUICKDRAW" subtitle="FREE · REACTION" accent="pink" icon="⚡" cost="FREE" onClick={()=>setModal("reaction")}/><Cabinet title="LUCKY 7" subtitle="TICKET SLOTS" accent="gold" icon="7" cost="1" onClick={()=>setModal("slots")}/><Cabinet title="TWENTY ONE" subtitle="CARD TABLE" accent="cyan" icon="♠" cost="2" onClick={()=>setModal("twentyone")}/></div><div className="arcade-center-mini-games"><GameCard icon="▦" name="MEMORY MATRIX" note="repeat five lights" cost="1 TOKEN" onClick={()=>setModal("memory")}/><GameCard icon="♫" name="RHYTHM RUSH" note="hit four beats" cost="1 TOKEN" onClick={()=>setModal("rhythm")}/><GameCard icon="🏎️" name="PIXEL RACER" note="dodge six hazards" cost="1 TOKEN" onClick={()=>setModal("pixelracer")}/></div>
        <div className="arcade-right-bank"><Cabinet title="STAR CHASER" subtitle={hasStarFragment?"SKY LINK READY":"SIGNAL LOST"} accent="blue" icon="✦" cost="LINK" onClick={starCabinet}/><Cabinet title="OUT OF ORDER" subtitle={secretAvailable?"...BOOT?":`${uniqueWins}/7 CLEARS`} accent="glitch" icon="?" cost="???" onClick={bootSecret}/><Cabinet title="GHOST SAVE" subtitle="NO CONTROLLER" accent="violet" icon="◌" cost="OFF" onClick={()=>setToast("PLAYER TWO: ROOM_05 · CONTROLLER NOT FOUND.")}/></div>
      </div>}

      {zone===1 && <div className="arcade-zone-content arcade-midway-floor">
        <div className="arcade-zone-sign"><small>CARNIVAL WING</small><strong>THE MIDWAY</strong><span>games of skill · suspiciously generous tickets</span></div>
        <div className="arcade-midway-games"><GameCard icon="🏀" name="HOOP FEVER" note="five shots" cost="1 TOKEN" onClick={()=>setModal("basketball")}/><GameCard icon="🤡" name="HIT THE CLOWN" note="10 second bonkfest" cost="FREE" onClick={()=>setModal("clown")}/><GameCard icon="🔴" name="BEANBAG BONANZA" note="three throws" cost="1 TOKEN" onClick={()=>setModal("beanbag")}/><GameCard icon="🕹️" name="LUCKY CLAW" note="toys · books · figurines" cost="2 TOKENS" onClick={()=>setModal("claw")}/><GameCard icon="🎳" name="SKEE BALL" note="five balls · choose risk" cost="2 TOKENS" onClick={()=>setModal("skeeball")}/><GameCard icon="⭕" name="RING TOSS" note="five rings · three targets" cost="1 TOKEN" onClick={()=>setModal("ringtoss")}/><GameCard icon="🥫" name="BOTTLE BASH" note="three balls · ten bottles" cost="1 TOKEN" onClick={()=>setModal("bottlebash")}/></div>
        <button className="arcade-claw-shelf-preview" onClick={()=>setModal("collection")}><small>PRIZE SHELF</small><div>🧸 · 🐇 · 🔭 · 🐈 · 📘 · 🤖</div><strong>{save.collectibles.length}/6 COLLECTED</strong></button>
      </div>}

      {zone===2 && <div className="arcade-zone-content arcade-jackpot-floor">
        <div className="arcade-zone-sign arcade-jackpot-sign"><small>FICTIONAL TOKENS ONLY</small><strong>JACKPOT LOUNGE</strong><span>high-ticket games · very real bragging rights</span></div>
        <div className="arcade-jackpot-tables"><CasinoCard icon="🎡" name="LUCKY WHEEL" note="up to 25 tickets" cost="2 TOKENS" onClick={()=>setModal("wheel")}/><CasinoCard icon="🂡" name="HIGH / LOW" note="quick ticket table" cost="1 TOKEN" onClick={()=>setModal("highlow")}/><CasinoCard icon="🎲" name="DICE DUEL" note="7 · doubles · twelve" cost="2 TOKENS" onClick={()=>setModal("dice")}/><CasinoCard icon="★★★" name="TRIPLE STAR" note="45-ticket jackpot" cost="3 TOKENS" onClick={()=>setModal("triplestar")}/><CasinoCard icon="🃏" name="POKER DRAW" note="pair · trips · full house" cost="3 TOKENS" onClick={()=>setModal("poker")}/><CasinoCard icon="◐" name="COLOR BET" note="red · black · rare gold" cost="2 TOKENS" onClick={()=>setModal("colorbet")}/><CasinoCard icon="🔐" name="VAULT PICK" note="nine doors · one gold vault" cost="2 TOKENS" onClick={()=>setModal("vaultpick")}/></div>
        <button className="arcade-vip-booth" onClick={()=>setToast("VIP receipt: DEPARTURE 11:47 · PLATFORM 7.")}><span>VIP 07</span><strong>TABLE RESERVED</strong><small>receipt tucked beneath the glass...</small></button>
      </div>}

      {zone===0 && <>
        <button className="arcade-token-machine" onClick={()=>setModal("token")}><i/><strong>TOKENS</strong><span>PLAYER CARD</span><em>◎</em></button>
        <button className="arcade-prize-counter" onClick={()=>setModal("prizes")}><span className="prize-sign">PRIZE EXCHANGE</span><div className="prize-shelf">🧸 👾 🌙 🪩 🌱 ⭐ 🪐 📼</div><strong>{save.tickets} tickets available</strong></button>
        <button className="arcade-snack-bar" onClick={()=>setModal("food")}><span>PIXEL BITES</span><div>🍟 🥤 🍿 🥨 🧀 🥛</div><small>fuel for irresponsible high scores</small></button>
      </>}
      <aside className="arcade-progress-board"><small>AFTER-HOURS CHALLENGE</small><strong>{secretAvailable?"SECRET CABINET READY":"CLEAR SEVEN DIFFERENT GAMES"}</strong><div className="arcade-progress-pips">{[0,1,2,3,4,5,6].map(n=><i key={n} className={n<uniqueWins?"is-on":""}/>)}</div><span>{save.claimedFragment?"◈ PLAYER ONE SAVED":save.secretBooted?"120 tickets unlock the fragment":`${uniqueWins}/7 unique clears`}</span></aside>
      <p className="arcade-floor-toast">{toast}</p>
    </section>

    {modal && <div className="arcade-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className={`arcade-modal arcade-modal-${modal}`}><button className="arcade-modal-close" onClick={()=>setModal(null)}>×</button>
      {modal==="token" && <><Heading eyebrow="TOKEN COUNTER" title="Keep Playing" text="Refill fictional arcade tokens without getting stuck."/><div className="arcade-token-options"><TokenOption icon="🎟️" title="Welcome Roll" text={save.welcomeClaimed?"already claimed":"+5 tokens · one time"} disabled={save.welcomeClaimed} onClick={claimWelcome}/><TokenOption icon="🪪" title="Player Card Stamp" text={`every 5 paid rounds → +2 tokens · ${save.paidPlays%5}/5`} disabled={Math.floor(save.paidPlays/5)<=save.tokenStamp} onClick={claimStamp}/><TokenOption icon="🪙" title="Check Coin Return" text={`every 3 paid rounds → +1 token · ${save.paidPlays%3}/3`} disabled={Math.floor(save.paidPlays/3)<=save.coinReturnStamp} onClick={claimCoinReturn}/><TokenOption icon="🔁" title="Ticket Exchange" text="20 tickets → 3 tokens" disabled={save.tickets<20} onClick={tradeTickets}/><TokenOption icon="🆘" title="Emergency Free Play" text="0 tokens → +3" disabled={save.tokens>0} onClick={emergency}/></div><p className="arcade-ticket-balance">{save.tokens} TOKENS · {save.tickets} TICKETS</p></>}
      {modal==="reaction" && <><Heading eyebrow="MAIN FLOOR · FREE" title="Quickdraw Lights" text="Wait for green, then hit it."/><button className={`arcade-reaction-pad is-${reactionState}`} disabled={["idle","done","too-early"].includes(reactionState)} onClick={hitReaction}>{reactionState==="waiting"?"WAIT...":reactionState==="ready"?"HIT!":reactionState==="done"?`${reactionMs} ms`:reactionState==="too-early"?"TOO EARLY":"READY?"}</button><button className="arcade-primary-button" onClick={startReaction}>START · FREE</button></>}
      {modal==="slots" && <><Heading eyebrow="MAIN FLOOR · 1 TOKEN" title="Lucky 7" text="Ticket slots using fictional arcade tokens only."/><div className="arcade-slot-reels">{reels.map((r,i)=><span key={i}>{r}</span>)}</div><p className="arcade-game-message">{slotMessage}</p><button className="arcade-primary-button" onClick={spinSlots} disabled={spinning}>SPIN · 1 TOKEN</button></>}
      {modal==="twentyone" && <><Heading eyebrow="MAIN FLOOR · 2 TOKENS" title="Twenty One" text="Get close to 21 without going over."/><div className="arcade-card-row">{cards.map((c,i)=><span key={i}>{c}</span>)}</div><strong className="arcade-total">TOTAL · {total21}</strong><p className="arcade-game-message">{twentyOneMessage}</p>{!twentyOneActive?<button className="arcade-primary-button" onClick={start21}>NEW HAND · 2 TOKENS</button>:<div className="arcade-button-row"><button onClick={hit21}>HIT</button><button onClick={()=>finish21()}>STAND</button></div>}</>}
      {modal==="basketball" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Hoop Fever" text="Five shots. Three baskets clears the machine."/><div className="arcade-hoop">🏀 <span>▱</span></div><div className="arcade-shot-dots">{[0,1,2,3,4,5,6].map(n=><i key={n} className={basketShots[n]===1?"made":basketShots[n]===0?"miss":""}/>)}</div><p className="arcade-game-message">{basketMessage}</p>{basketShots.length===0||basketShots.length===5?<button className="arcade-primary-button" onClick={startBasketball}>{basketShots.length===5?"PLAY AGAIN":"START"} · 1 TOKEN</button>:<button className="arcade-primary-button" onClick={basketShoot}>SHOOT!</button>}</>}
      {modal==="clown" && <><Heading eyebrow="MIDWAY · FREE" title="Hit the Clown" text="Bonk the lit clown. Five hits clears it."/><div className="arcade-clown-grid">{[0,1,2,3,4,5,6,7,8].map(n=><button key={n} className={clownActive&&clownTarget===n?"is-target":""} onClick={()=>whack(n)}>{clownActive&&clownTarget===n?"🤡":"○"}</button>)}</div><p className="arcade-game-message">{clownHits} HITS · {clownTime}s</p><button className="arcade-primary-button" onClick={startClown} disabled={clownActive}>START · FREE</button></>}
      {modal==="beanbag" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Beanbag Bonanza" text="Three throws. Higher holes score more."/><div className="arcade-beanbag-board">{[3,5,8,10].map(p=><button key={p} disabled={beanbagThrows<=0} onClick={()=>throwBeanbag(p)}><span>{p}</span><small>PTS</small></button>)}</div><p className="arcade-game-message">SCORE {beanbagScore} · THROWS {beanbagThrows}</p><button className="arcade-primary-button" onClick={startBeanbag}>NEW ROUND · 1 TOKEN</button></>}
      {modal==="claw" && <><Heading eyebrow="CLAW ALLEY · 2 TOKENS" title="Lucky Claw" text="Collect toys, books and figurines that can later appear on shelves in other rooms."/><div className="arcade-claw-machine"><div className="arcade-claw-rail"><span style={{left:`${clawPosition}%`}}>⌄</span></div><div className="arcade-claw-pile">🧸 🐇 🔭 🐈 📘 🤖</div></div><input className="arcade-claw-slider" type="range" min="5" max="95" value={clawPosition} onChange={e=>setClawPosition(Number(e.target.value))}/><p className="arcade-game-message">{clawMessage}</p><button className="arcade-primary-button" onClick={dropClaw}>DROP CLAW · 2 TOKENS</button></>}
      {modal==="wheel" && <><Heading eyebrow="JACKPOT · 2 TOKENS" title="Lucky Wheel" text="Small chance, chunky ticket payouts."/><div className="arcade-wheel">{wheelValue??"✦"}<small>TICKETS</small></div><button className="arcade-primary-button" onClick={spinWheel}>SPIN · 2 TOKENS</button></>}
      {modal==="highlow" && <><Heading eyebrow="JACKPOT · 1 TOKEN" title="Higher / Lower" text="Guess whether the next card is higher or lower."/><div className="arcade-highlow-card">{highLowCard}</div><p className="arcade-game-message">{highLowMessage}</p><div className="arcade-button-row"><button onClick={()=>guessHighLow("low")}>LOWER · 1</button><button onClick={()=>guessHighLow("high")}>HIGHER · 1</button></div></>}
      {modal==="dice" && <><Heading eyebrow="JACKPOT · 2 TOKENS" title="Dice Duel" text="Seven, doubles and twelve pay extra."/><div className="arcade-dice-row"><span>{dice[0]}</span><span>{dice[1]}</span></div><button className="arcade-primary-button" onClick={rollDice}>ROLL · 2 TOKENS</button></>}
      {modal==="triplestar" && <><Heading eyebrow="VIP JACKPOT · 3 TOKENS" title="Triple Star" text="Two stars pay 16 tickets. Three matching stars can pay up to 45."/><div className="arcade-triple-row">{triple.map((v,i)=><span key={i}>{v}</span>)}</div><button className="arcade-primary-button" onClick={playTriple}>PLAY · 3 TOKENS</button></>}
      {modal==="memory" && <><Heading eyebrow="MAIN FLOOR · 1 TOKEN" title="Memory Matrix" text="Memorise five lamps, then repeat them in order."/><div className="arcade-memory-grid">{["PINK","CYAN","GOLD","GREEN"].map((x,i)=><button key={x} disabled={memoryLocked||!memorySeq.length} onClick={()=>pressMemory(i)}>{x}</button>)}</div><p className="arcade-game-message">{memoryMessage}</p><button className="arcade-primary-button" onClick={startMemory}>NEW SEQUENCE · 1 TOKEN</button></>}
      {modal==="rhythm" && <><Heading eyebrow="MAIN FLOOR · 1 TOKEN" title="Rhythm Rush" text="Hit four beats while the marker is inside the glowing target."/><div className="arcade-rhythm-track"><i style={{left:`${rhythmTarget}%`}}/><b style={{left:`${rhythmPos}%`}}>◆</b></div><p className="arcade-game-message">{rhythmHits}/4 BEATS</p>{!rhythmActive?<button className="arcade-primary-button" onClick={startRhythm}>START · 1 TOKEN</button>:<button className="arcade-primary-button" onClick={hitRhythm}>HIT BEAT</button>}</>}
      {modal==="skeeball" && <><Heading eyebrow="MIDWAY · 2 TOKENS" title="Skee Ball" text="Five balls. Safe, middle or risky corner lane."/><div className="arcade-risk-row"><button disabled={skeeBalls<=0} onClick={()=>rollSkee(1)}>SAFE<small>10–20</small></button><button disabled={skeeBalls<=0} onClick={()=>rollSkee(2)}>MIDDLE<small>20–30</small></button><button disabled={skeeBalls<=0} onClick={()=>rollSkee(3)}>CORNER<small>0–50</small></button></div><p className="arcade-game-message">SCORE {skeeScore} · BALLS {skeeBalls}</p><button className="arcade-primary-button" onClick={startSkee}>NEW GAME · 2 TOKENS</button></>}
      {modal==="ringtoss" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Ring Toss" text="Five rings. Harder targets score more."/><div className="arcade-risk-row"><button disabled={ringThrows<=0} onClick={()=>throwRing(1)}>🥤<small>EASY · 3</small></button><button disabled={ringThrows<=0} onClick={()=>throwRing(2)}>🧴<small>MEDIUM · 6</small></button><button disabled={ringThrows<=0} onClick={()=>throwRing(3)}>🏆<small>HARD · 9</small></button></div><p className="arcade-game-message">SCORE {ringScore} · RINGS {ringThrows}</p><button className="arcade-primary-button" onClick={startRings}>NEW ROUND · 1 TOKEN</button></>}
      {modal==="poker" && <><Heading eyebrow="JACKPOT · 3 TOKENS" title="Poker Draw" text="Quick five-card draw. Two-pair or better clears the table."/><div className="arcade-poker-hand">{pokerHand.map((x,i)=><span key={i}>{x}</span>)}</div><p className="arcade-game-message">{pokerMessage}</p><button className="arcade-primary-button" onClick={playPoker}>DEAL · 3 TOKENS</button></>}
      {modal==="colorbet" && <><Heading eyebrow="JACKPOT · 2 TOKENS" title="Color Bet" text="Red and black are common. Gold is rare, but pays more."/><div className={`arcade-color-result ${colorResult}`}>{colorResult.toUpperCase()}</div><div className="arcade-button-row"><button onClick={()=>colorBet("red")}>RED · 2</button><button onClick={()=>colorBet("black")}>BLACK · 2</button><button onClick={()=>colorBet("gold")}>GOLD · 2</button></div><p className="arcade-game-message">red/black 8 tickets · gold 28</p></>}
      {modal==="pixelracer" && <><Heading eyebrow="MAIN FLOOR · 1 TOKEN" title="Pixel Racer" text="Six turns. Pick a lane each turn and try not to meet the incoming hazard."/><div className="arcade-racer-road"><i className={racerHazard===0?"hazard":""}>LEFT</i><i className={racerHazard===1?"hazard":""}>CENTRE</i><i className={racerHazard===2?"hazard":""}>RIGHT</i><b style={{left:`${16+racerLane*34}%`}}>🏎️</b></div><p className="arcade-game-message">{racerMessage} · ROUND {racerRound}/6</p>{!racerActive?<button className="arcade-primary-button" onClick={startPixelRacer}>START RACE · 1 TOKEN</button>:<div className="arcade-button-row"><button onClick={()=>driveRacer(0)}>LEFT</button><button onClick={()=>driveRacer(1)}>CENTRE</button><button onClick={()=>driveRacer(2)}>RIGHT</button></div>}</>}
      {modal==="bottlebash" && <><Heading eyebrow="MIDWAY · 1 TOKEN" title="Bottle Bash" text="Three throws. Pick a power level; the hidden sweet spot changes every throw."/><div className="arcade-bottle-stack"><span>{"🥫".repeat(Math.max(0,bottlesLeft))}</span></div><p className="arcade-game-message">{bottleMessage} · THROWS {bottleThrows}</p>{bottleThrows===0?<button className="arcade-primary-button" onClick={startBottleBash}>NEW GAME · 1 TOKEN</button>:<div className="arcade-button-row"><button onClick={()=>throwBottleBall(1)}>SOFT</button><button onClick={()=>throwBottleBall(2)}>MEDIUM</button><button onClick={()=>throwBottleBall(3)}>HARD</button></div>}</>}
      {modal==="vaultpick" && <><Heading eyebrow="JACKPOT LOUNGE · 2 TOKENS" title="Vault Pick" text="Nine miniature vaults. One is gold, one is silver, and a few hide loose tickets."/><div className="arcade-vault-grid">{Array.from({length:9},(_,i)=><button key={i} className={vaultOpened===i?"is-open":""} onClick={()=>playVaultPick(i)}>{vaultOpened===i?"🔓":"🔒"}<small>{i+1}</small></button>)}</div><p className="arcade-game-message">{vaultMessage}</p></>}
      {modal==="reset" && <><Heading eyebrow="FRESH RUN" title="Reset for a New Player" text="This resets Neon Clover itself without touching Midnight Study, Observatory, the hallway, or any other room."/><div className="arcade-reset-warning"><strong>ARCADE-ONLY RESET</strong><p>Arcade tokens, tickets, game scores, cabinet clears and local prize-counter progress reset. Cross-room items already earned stay in your Backpack, and every other room keeps its progress.</p></div><button className="arcade-danger-button" onClick={resetArcade}>RESET ARCADE ONLY</button></>}
      {modal==="food" && <><Heading eyebrow="PIXEL BITES" title="Snack Counter" text="Questionable food is required arcade infrastructure."/><div className="arcade-food-grid">{FOOD.map(([id,icon,name,note])=><button key={id} onClick={()=>tasteFood(id,icon,name,note)}><span>{icon}</span><strong>{name}</strong><small>{save.foodTried.includes(id)?"tried ✓":"taste"}</small></button>)}</div></>}
      {modal==="collection" && <><Heading eyebrow="CLAW ALLEY" title="Your Arcade Collection" text="These finds can later physically appear on shelves in Nostalgia, Observatory or Dream."/><div className="arcade-collection-shelf">{CLAW_TOYS.map(t=>{const owned=save.collectibles.includes(t.id);return <div key={t.id} className={owned?"is-owned":"is-empty"}><span>{owned?t.icon:"?"}</span><strong>{owned?t.name:"empty shelf"}</strong><small>{owned?t.note:"win it from the claw"}</small></div>})}</div></>}
      {modal==="prizes" && <><Heading eyebrow="PRIZE EXCHANGE" title="Spend Your Tickets" text="Cheap nonsense, collectibles and cross-room items."/><div className="arcade-prize-grid arcade-prize-grid-large">{PRIZES.map(([id,icon,name,cost,note])=>{const claimed=save.purchasedPrizes.includes(id);return <PrizeCard key={id} icon={icon} name={name} cost={claimed?"CLAIMED":String(cost)} note={note} disabled={claimed||save.tickets<cost} onClick={()=>buyPrize(id,cost)}/>})}<PrizeCard icon="◈" name="Pixel Fragment" cost={save.claimedFragment?"RECOVERED":"120"} note={save.secretBooted?"after-hours grand prize":"case sealed · find the broken cabinet"} disabled={save.claimedFragment||!save.secretBooted||save.tickets<120} onClick={claimFragment} special/></div><p className="arcade-ticket-balance">AVAILABLE · {save.tickets} TICKETS</p></>}
      {modal==="scores" && <><Heading eyebrow="PLAYER ONE" title="High Score Archive" text="Seven different clears wake the OUT OF ORDER cabinet."/><div className="arcade-score-list">{scoreRows.map(([name,id])=><div key={id}><span>{name}</span><strong>{save.highScores[id]??"---"}</strong></div>)}</div><p className="arcade-modal-copy">DIFFERENT GAMES CLEARED · <b>{uniqueWins}/7</b></p></>}
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

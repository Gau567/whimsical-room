"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

type ArcadeModal =
  | null
  | "slots"
  | "reaction"
  | "twentyone"
  | "prizes"
  | "food"
  | "secret"
  | "scores"
  | "token";

type ReactionState = "idle" | "waiting" | "ready" | "done" | "too-early";

type ArcadeSave = {
  tokens: number;
  tickets: number;
  claimedTokenBonus: boolean;
  wins: string[];
  highScores: Record<string, number>;
  secretBooted: boolean;
  claimedDisk: boolean;
  claimedFragment: boolean;
  claimedDreamPrize: boolean;
  claimedGreenhousePrize: boolean;
  claimedStarBonus: boolean;
  foodTried: string[];
};

const STORAGE_KEY = "arcade-v1-progress";

const DEFAULT_SAVE: ArcadeSave = {
  tokens: 5,
  tickets: 0,
  claimedTokenBonus: false,
  wins: [],
  highScores: { reaction: 0, slots: 0, twentyone: 0 },
  secretBooted: false,
  claimedDisk: false,
  claimedFragment: false,
  claimedDreamPrize: false,
  claimedGreenhousePrize: false,
  claimedStarBonus: false,
  foodTried: [],
};

const SLOT_SYMBOLS = ["★", "7", "🍒", "◆", "☾", "✦"];
const FOOD = [
  { id: "fries", icon: "🍟", name: "Pixel Fries", note: "crispy, salty, suspiciously perfect cubes" },
  { id: "soda", icon: "🥤", name: "Neon Soda", note: "blue raspberry, allegedly" },
  { id: "popcorn", icon: "🍿", name: "Jackpot Popcorn", note: "the bucket says NO REFUNDS AFTER PROPHECY" },
  { id: "pretzel", icon: "🥨", name: "Power-Up Pretzel", note: "+0 actual stats · +12 morale" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function ArcadeRoom() {
  const {
    returnToHub,
    hasItem,
    addItem,
    completeQuest,
    discoverClue,
  } = useWorld();

  const [save, setSave] = useState<ArcadeSave>(DEFAULT_SAVE);
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<ArcadeModal>(null);
  const [toast, setToast] = useState("the carpet is louder than the music.");
  const [marqueeOn, setMarqueeOn] = useState(true);
  const [jackpotPulse, setJackpotPulse] = useState(false);

  // Slots
  const [reels, setReels] = useState(["7", "★", "🍒"]);
  const [slotMessage, setSlotMessage] = useState("1 token per spin · tickets only, no real money");
  const [spinning, setSpinning] = useState(false);

  // Reaction game
  const [reactionState, setReactionState] = useState<ReactionState>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const reactionReadyAt = useRef(0);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Twenty One
  const [cards, setCards] = useState<number[]>([8, 7]);
  const [twentyOneMessage, setTwentyOneMessage] = useState("get close to 21 without going over");
  const [twentyOneActive, setTwentyOneActive] = useState(false);

  const hasStarFragment = hasItem("star-fragment");
  const uniqueWins = save.wins.length;
  const secretAvailable = uniqueWins >= 3;
  const total21 = cards.reduce((sum, card) => sum + card, 0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ArcadeSave>;
        setSave({
          ...DEFAULT_SAVE,
          ...parsed,
          wins: Array.isArray(parsed.wins) ? parsed.wins : [],
          highScores: { ...DEFAULT_SAVE.highScores, ...(parsed.highScores ?? {}) },
          foodTried: Array.isArray(parsed.foodTried) ? parsed.foodTried : [],
        });
      }
    } catch {
      // Keep defaults if storage was corrupted or blocked.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      // The room still works without persistence.
    }
  }, [save, hydrated]);

  useEffect(() => {
    return () => {
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!secretAvailable || save.secretBooted) return;
    const id = window.setTimeout(() => {
      setToast("the OUT OF ORDER cabinet just turned itself on.");
      setJackpotPulse(true);
      window.setTimeout(() => setJackpotPulse(false), 1800);
    }, 650);
    return () => window.clearTimeout(id);
  }, [secretAvailable, save.secretBooted]);

  const scoreRows = useMemo(
    () => [
      ["QUICKDRAW", save.highScores.reaction ? `${save.highScores.reaction} pts` : "---"],
      ["LUCKY 7", save.highScores.slots ? `${save.highScores.slots} tix` : "---"],
      ["TWENTY ONE", save.highScores.twentyone ? `${save.highScores.twentyone} pts` : "---"],
    ],
    [save.highScores],
  );

  function changeSave(update: (current: ArcadeSave) => ArcadeSave) {
    setSave((current) => update(current));
  }

  function spendToken() {
    if (save.tokens <= 0) {
      setToast("no tokens. the token machine is judging you quietly.");
      setModal("token");
      return false;
    }
    changeSave((current) => ({ ...current, tokens: current.tokens - 1 }));
    return true;
  }

  function awardTickets(amount: number, message?: string) {
    changeSave((current) => ({ ...current, tickets: current.tickets + amount }));
    if (message) setToast(message);
  }

  function markWin(game: string) {
    changeSave((current) => ({
      ...current,
      wins: current.wins.includes(game) ? current.wins : [...current.wins, game],
    }));
  }

  function claimTokenBonus() {
    if (save.claimedTokenBonus) {
      if (save.tokens === 0) {
        changeSave((current) => ({ ...current, tokens: current.tokens + 2 }));
        setToast("EMERGENCY FREE PLAY · two tokens drop so the room cannot soft-lock you.");
      } else {
        setToast("the machine reads: FREE PLAY ALREADY CLAIMED · come back if you hit zero.");
      }
      return;
    }
    changeSave((current) => ({ ...current, tokens: current.tokens + 4, claimedTokenBonus: true }));
    setToast("clunk. clunk. clunk. clunk. four house tokens drop into the tray.");
  }

  function spinSlots() {
    if (spinning || !spendToken()) return;
    setSpinning(true);
    setSlotMessage("reels rattling...");

    window.setTimeout(() => {
      const next = [0, 1, 2].map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
      setReels(next);

      const same3 = next[0] === next[1] && next[1] === next[2];
      const same2 = next[0] === next[1] || next[1] === next[2] || next[0] === next[2];
      const sevens = next.filter((symbol) => symbol === "7").length;

      let payout = 3;
      if (same3) payout = next[0] === "7" ? 45 : 28;
      else if (sevens >= 2) payout = 22;
      else if (same2) payout = 10;

      awardTickets(payout);
      changeSave((current) => ({
        ...current,
        highScores: { ...current.highScores, slots: Math.max(current.highScores.slots, payout) },
      }));

      if (payout >= 10) markWin("lucky-seven");
      setSlotMessage(payout >= 10 ? `WIN · ${payout} tickets!` : `${payout} consolation tickets · the house feels bad`);
      setSpinning(false);
    }, 720);
  }

  function startReaction() {
    if (reactionState === "waiting" || reactionState === "ready") return;
    setReactionMs(null);
    setReactionState("waiting");
    const delay = 1200 + Math.floor(Math.random() * 2100);
    reactionTimer.current = setTimeout(() => {
      reactionReadyAt.current = performance.now();
      setReactionState("ready");
    }, delay);
  }

  function hitReaction() {
    if (reactionState === "waiting") {
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      setReactionState("too-early");
      return;
    }
    if (reactionState !== "ready") return;

    const ms = Math.round(performance.now() - reactionReadyAt.current);
    setReactionMs(ms);
    setReactionState("done");

    const points = clamp(650 - ms, 50, 500);
    const ticketGain = ms <= 260 ? 25 : ms <= 360 ? 15 : 8;
    awardTickets(ticketGain);
    changeSave((current) => ({
      ...current,
      highScores: { ...current.highScores, reaction: Math.max(current.highScores.reaction, points) },
    }));

    if (ms <= 420) markWin("quickdraw");
  }

  function startTwentyOne() {
    if (!spendToken()) return;
    const first = 2 + Math.floor(Math.random() * 9);
    const second = 2 + Math.floor(Math.random() * 9);
    setCards([first, second]);
    setTwentyOneActive(true);
    setTwentyOneMessage("hit or stand · target 21");
  }

  function hitTwentyOne() {
    if (!twentyOneActive) return;
    const next = 1 + Math.floor(Math.random() * 10);
    const newCards = [...cards, next];
    const total = newCards.reduce((sum, card) => sum + card, 0);
    setCards(newCards);
    if (total > 21) {
      setTwentyOneActive(false);
      setTwentyOneMessage(`BUST · ${total} · the dealer slides you 2 pity tickets`);
      awardTickets(2);
    } else if (total === 21) {
      finishTwentyOne(newCards, true);
    }
  }

  function standTwentyOne() {
    if (!twentyOneActive) return;
    finishTwentyOne(cards, false);
  }

  function finishTwentyOne(finalCards: number[], natural = false) {
    const total = finalCards.reduce((sum, card) => sum + card, 0);
    setTwentyOneActive(false);
    let payout = 0;
    if (total === 21) payout = natural ? 32 : 26;
    else if (total >= 19) payout = 20;
    else if (total >= 17) payout = 12;
    else payout = 4;

    awardTickets(payout);
    const score = total <= 21 ? 100 - Math.abs(21 - total) * 8 : 0;
    changeSave((current) => ({
      ...current,
      highScores: { ...current.highScores, twentyone: Math.max(current.highScores.twentyone, score) },
    }));

    if (total >= 17 && total <= 21) markWin("twenty-one");
    setTwentyOneMessage(`${total} · ${payout} tickets paid out`);
  }

  function bootSecretCabinet() {
    if (!secretAvailable) {
      setToast(`OUT OF ORDER · ${3 - uniqueWins} more different cabinet${3 - uniqueWins === 1 ? "" : "s"} must be beaten.`);
      return;
    }
    setModal("secret");
    if (!save.secretBooted) {
      changeSave((current) => ({ ...current, secretBooted: true }));
      discoverClue("arcade-corrupted-save");
      discoverClue("train-platform-seven");
      setToast("the cabinet boots into a save file that knows too much.");
    }
  }

  function takeSystemDisk() {
    if (save.claimedDisk) return;
    addItem({
      id: "retro-system-disk",
      name: "Retro System Disk",
      icon: "▣",
      description: "A translucent arcade save disk labelled NOSTALGIA_01. The back is scratched with 04/17 and P7 · 11:47.",
      sourceRoom: "arcade",
      useIn: "nostalgia",
    });
    discoverClue("arcade-nostalgia-disk");
    changeSave((current) => ({ ...current, claimedDisk: true }));
    setToast("Retro System Disk added to Backpack · maybe Room 01's computer can read it.");
  }

  function claimFragment() {
    if (save.claimedFragment || !save.secretBooted || save.tickets < 80) return;
    addItem({
      id: "pixel-fragment",
      name: "Pixel Fragment",
      icon: "◈",
      description: "A translucent square shard that flickers between magenta, cyan and gold. It feels like a saved frame from a game that never existed.",
      sourceRoom: "arcade",
      useIn: "dream",
    });
    completeQuest("arcade-after-hours");
    discoverClue("arcade-pixel-fragment");
    changeSave((current) => ({ ...current, claimedFragment: true }));
    setToast("PIXEL FRAGMENT recovered · the hallway lights blink in sequence.");
  }

  function claimDreamPrize() {
    if (save.claimedDreamPrize || save.tickets < 45) return;
    addItem({
      id: "mirror-token",
      name: "Mirror Token",
      icon: "◌",
      description: "A prize token polished like a mirror. Your reflection seems half a second late.",
      sourceRoom: "arcade",
      useIn: "dream",
    });
    changeSave((current) => ({ ...current, tickets: current.tickets - 45, claimedDreamPrize: true }));
    setToast("Mirror Token redeemed · definitely normal prize-counter merchandise.");
  }

  function claimGreenhousePrize() {
    if (save.claimedGreenhousePrize || save.tickets < 35) return;
    addItem({
      id: "moonflower-seed-packet",
      name: "Moonflower Seed Packet",
      icon: "✿",
      description: "A tiny arcade prize packet marked: WATER ONLY UNDER FALSE STARLIGHT.",
      sourceRoom: "arcade",
      useIn: "greenhouse",
    });
    changeSave((current) => ({ ...current, tickets: current.tickets - 35, claimedGreenhousePrize: true }));
    setToast("Moonflower Seeds redeemed · future Greenhouse problem acquired.");
  }

  function tryFood(id: string) {
    const food = FOOD.find((item) => item.id === id);
    if (!food) return;
    changeSave((current) => ({
      ...current,
      foodTried: current.foodTried.includes(id) ? current.foodTried : [...current.foodTried, id],
    }));
    setToast(`${food.icon} ${food.name}: ${food.note}`);
  }

  return (
    <main className={`arcade-room ${marqueeOn ? "is-lit" : "is-dim"} ${jackpotPulse ? "is-jackpot" : ""}`}>
      <div className="arcade-grain" aria-hidden="true" />
      <div className="arcade-neon-haze" aria-hidden="true" />

      <header className="arcade-header">
        <button className="arcade-back" type="button" onClick={returnToHub}>← hallway</button>
        <div>
          <p>ROOM 03 · AFTER HOURS</p>
          <h1>Neon Clover Arcade</h1>
          <span>arcade floor · prize hall · midnight gaming lounge</span>
        </div>
        <div className="arcade-wallet" aria-label="Arcade wallet">
          <span><b>{save.tokens}</b> TOKENS</span>
          <span><b>{save.tickets}</b> TICKETS</span>
        </div>
      </header>

      <section className="arcade-scene" aria-label="Retro arcade and playful casino floor">
        <div className="arcade-ceiling" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i />
        </div>

        <button className="arcade-neon-sign" type="button" onClick={() => setMarqueeOn((value) => !value)}>
          <small>WELCOME TO</small>
          <strong>NEON CLOVER</strong>
          <span>ARCADE · GAMES · PRIZES</span>
        </button>

        <button className="arcade-scoreboard" type="button" onClick={() => setModal("scores")}>
          <small>LOCAL HIGH SCORES</small>
          <strong>{uniqueWins}/3 CABINETS CLEARED</strong>
          <span>tap to inspect</span>
        </button>

        <div className="arcade-left-bank">
          <Cabinet title="QUICKDRAW" subtitle="REACTION" accent="pink" onClick={() => setModal("reaction")} icon="⚡" />
          <Cabinet title="LUCKY 7" subtitle="TICKET SLOTS" accent="gold" onClick={() => setModal("slots")} icon="7" />
          <Cabinet title="TWENTY ONE" subtitle="CARD TABLE" accent="cyan" onClick={() => setModal("twentyone")} icon="♠" />
        </div>

        <div className="arcade-right-bank">
          <Cabinet title="STAR CHASER" subtitle={hasStarFragment ? "OBSERVATORY LINK" : "SIGNAL LOST"} accent="blue" onClick={() => {
            if (hasStarFragment && !save.claimedStarBonus) {
              awardTickets(5, "the cabinet recognises the Star Fragment · +5 starlight tickets.");
              discoverClue("arcade-starlight-recognised");
              changeSave((current) => ({ ...current, claimedStarBonus: true }));
            } else if (hasStarFragment) {
              setToast("STAR CHASER: STELLAR SIGNATURE ALREADY RECORDED.");
            } else {
              setToast("STAR CHASER displays: INSERT SOMETHING THAT REMEMBERS THE SKY.");
            }
          }} icon="✦" />
          <Cabinet title="OUT OF ORDER" subtitle={secretAvailable ? "...BOOT?" : `${uniqueWins}/3 WINS`} accent="glitch" onClick={bootSecretCabinet} icon="?" />
          <Cabinet title="GHOST SAVE" subtitle="NO CONTROLLER" accent="violet" onClick={() => setToast("player two is listed as: ROOM_05. no controller is attached.")} icon="◌" />
        </div>

        <button className="arcade-token-machine" type="button" onClick={() => setModal("token")}>
          <i className="token-machine-light" />
          <strong>TOKENS</strong>
          <span>FREE PLAY</span>
          <em>●</em>
        </button>

        <button className="arcade-prize-counter" type="button" onClick={() => setModal("prizes")}>
          <span className="prize-sign">PRIZE EXCHANGE</span>
          <div className="prize-shelf" aria-hidden="true">
            <i>🧸</i><i>👾</i><i>🌙</i><i>🪩</i><i>🌱</i><i>⭐</i>
          </div>
          <strong>tickets accepted</strong>
        </button>

        <button className="arcade-snack-bar" type="button" onClick={() => setModal("food")}>
          <span>PIXEL BITES</span>
          <div>🍟 🥤 🍿 🥨</div>
          <small>food that has no business glowing this much</small>
        </button>

        <div className="arcade-center-floor" aria-hidden="true">
          <div className="arcade-chandelier"><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <div className="arcade-carpet-stars">✦ · ◆ · ✦ · ● · ◆ · ✦</div>
        </div>

        <div className="arcade-lounge" aria-hidden="true">
          <div className="arcade-stool" /><div className="arcade-stool" />
          <div className="arcade-couch"><span /></div>
        </div>

        <aside className="arcade-progress-board">
          <small>AFTER-HOURS CHALLENGE</small>
          <strong>{secretAvailable ? "SECRET CABINET READY" : "BEAT THREE CABINETS"}</strong>
          <div className="arcade-progress-pips">
            {[0, 1, 2].map((index) => <i key={index} className={index < uniqueWins ? "is-on" : ""} />)}
          </div>
          <span>{save.claimedFragment ? "◈ fragment recovered" : save.secretBooted ? "80 tickets unlock the strange prize" : "the broken cabinet is listening"}</span>
        </aside>

        <p className="arcade-floor-toast" aria-live="polite">{toast}</p>
      </section>

      {modal && (
        <div className="arcade-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}>
          <section className={`arcade-modal arcade-modal-${modal}`} role="dialog" aria-modal="true">
            <button className="arcade-modal-close" type="button" onClick={() => setModal(null)}>×</button>

            {modal === "token" && (
              <>
                <ModalHeading eyebrow="TOKEN EXCHANGE" title="House Tokens" text="No cash, no purchases — these are fictional room tokens used only for the mini-games." />
                <div className="arcade-token-tray">● ● ● ●</div>
                <p className="arcade-modal-copy">Every fresh arcade save begins with 5 tokens. The machine also gives one free four-token refill.</p>
                <button className="arcade-primary-button" type="button" onClick={claimTokenBonus} disabled={save.claimedTokenBonus && save.tokens > 0}>
                  {save.claimedTokenBonus ? (save.tokens === 0 ? "EMERGENCY +2 TOKENS" : "FREE PLAY CLAIMED") : "CLAIM 4 FREE TOKENS"}
                </button>
              </>
            )}

            {modal === "slots" && (
              <>
                <ModalHeading eyebrow="CABINET 03-A" title="Lucky 7" text="A playful ticket-slot machine. Tokens are fictional arcade currency; there is no real-money wagering." />
                <div className={`arcade-slot-reels ${spinning ? "is-spinning" : ""}`}>
                  {reels.map((reel, index) => <span key={`${reel}-${index}`}>{reel}</span>)}
                </div>
                <p className="arcade-game-message">{slotMessage}</p>
                <button className="arcade-primary-button" type="button" onClick={spinSlots} disabled={spinning}>SPIN · 1 TOKEN</button>
              </>
            )}

            {modal === "reaction" && (
              <>
                <ModalHeading eyebrow="CABINET 03-B" title="Quickdraw Lights" text="Wait for the panel to turn green, then hit it as quickly as you can." />
                <button
                  className={`arcade-reaction-pad is-${reactionState}`}
                  type="button"
                  onClick={hitReaction}
                  disabled={reactionState === "idle" || reactionState === "done" || reactionState === "too-early"}
                >
                  {reactionState === "waiting" ? "WAIT..." : reactionState === "ready" ? "HIT!" : reactionState === "done" ? `${reactionMs} ms` : reactionState === "too-early" ? "TOO EARLY" : "READY?"}
                </button>
                {reactionState === "done" && <p className="arcade-game-message">{reactionMs && reactionMs <= 420 ? "cabinet clear ✓" : "under 420 ms clears the cabinet"}</p>}
                <button className="arcade-primary-button" type="button" onClick={startReaction}>START ROUND</button>
              </>
            )}

            {modal === "twentyone" && (
              <>
                <ModalHeading eyebrow="TABLE CABINET 03-C" title="Twenty One" text="Draw number cards. Get as close to 21 as possible without going over." />
                <div className="arcade-card-row">
                  {cards.map((card, index) => <span key={`${card}-${index}`}>{card}</span>)}
                </div>
                <strong className="arcade-total">TOTAL · {total21}</strong>
                <p className="arcade-game-message">{twentyOneMessage}</p>
                {!twentyOneActive ? (
                  <button className="arcade-primary-button" type="button" onClick={startTwentyOne}>NEW HAND · 1 TOKEN</button>
                ) : (
                  <div className="arcade-button-row">
                    <button type="button" onClick={hitTwentyOne}>HIT</button>
                    <button type="button" onClick={standTwentyOne}>STAND</button>
                  </div>
                )}
              </>
            )}

            {modal === "scores" && (
              <>
                <ModalHeading eyebrow="LOCAL BOARD" title="After-Hours Scores" text="Three different cabinet clears wake the machine nobody plugged in." />
                <div className="arcade-score-list">
                  {scoreRows.map(([name, score]) => <div key={name}><span>{name}</span><strong>{score}</strong></div>)}
                </div>
                <p className="arcade-modal-copy">Unique cabinets cleared: <b>{uniqueWins}/3</b></p>
              </>
            )}

            {modal === "food" && (
              <>
                <ModalHeading eyebrow="SNACK BAR" title="Pixel Bites" text="Optional. Entirely here because an arcade without questionable food would be suspicious." />
                <div className="arcade-food-grid">
                  {FOOD.map((food) => (
                    <button key={food.id} type="button" onClick={() => tryFood(food.id)}>
                      <span>{food.icon}</span><strong>{food.name}</strong><small>{save.foodTried.includes(food.id) ? "tried ✓" : "taste"}</small>
                    </button>
                  ))}
                </div>
              </>
            )}

            {modal === "prizes" && (
              <>
                <ModalHeading eyebrow="PRIZE EXCHANGE" title="Spend Your Tickets" text="Most prizes are silly. A few are absolutely not." />
                <div className="arcade-prize-grid">
                  <PrizeCard icon="👾" name="Glow Alien" cost="20" note="decorative · adorable · zero lore" disabled={save.tickets < 20} onClick={() => {
                    if (save.tickets < 20) return;
                    changeSave((current) => ({ ...current, tickets: current.tickets - 20 }));
                    setToast("you win a tiny glow alien. it immediately becomes emotionally important.");
                    setModal(null);
                  }} />
                  <PrizeCard icon="🌱" name="Moonflower Seeds" cost={save.claimedGreenhousePrize ? "CLAIMED" : "35"} note="future Greenhouse item" disabled={save.claimedGreenhousePrize || save.tickets < 35} onClick={claimGreenhousePrize} />
                  <PrizeCard icon="◌" name="Mirror Token" cost={save.claimedDreamPrize ? "CLAIMED" : "45"} note="future Dream Room item" disabled={save.claimedDreamPrize || save.tickets < 45} onClick={claimDreamPrize} />
                  <PrizeCard icon="◈" name="??? Fragment" cost={save.claimedFragment ? "RECOVERED" : "80"} note={save.secretBooted ? "the glass case has unlocked" : "case sealed · cabinet clearance required"} disabled={save.claimedFragment || !save.secretBooted || save.tickets < 80} onClick={claimFragment} special />
                </div>
                <p className="arcade-ticket-balance">AVAILABLE · {save.tickets} TICKETS</p>
              </>
            )}

            {modal === "secret" && (
              <>
                <ModalHeading eyebrow="OUT OF ORDER · SERVICE MODE" title="CORRUPTED SAVE FOUND" text="The cabinet has no game title. It has a user profile instead." />
                <div className="arcade-secret-terminal">
                  <p>&gt; BOOT LEGACY_SLOT_00</p>
                  <p>&gt; USER ........ GUEST</p>
                  <p>&gt; ORIGIN ...... NOSTALGIA_01</p>
                  <p>&gt; DATE ........ 04/17</p>
                  <p>&gt; DEPARTURE ... 11:47 / P7</p>
                  <p>&gt; SKY_CHECK ... {hasStarFragment ? "FRAGMENT PRESENT" : "NO RESPONSE"}</p>
                  <p className="is-glitch">&gt; ROOM_05 .... PLAYER TWO WAITING</p>
                </div>
                <div className="arcade-secret-disk">
                  <span>▣</span>
                  <div><strong>RETRO SYSTEM DISK</strong><small>NOSTALGIA_01 · unknown save format</small></div>
                  <button type="button" onClick={takeSystemDisk} disabled={save.claimedDisk}>{save.claimedDisk ? "TAKEN" : "TAKE DISK"}</button>
                </div>
                <p className="arcade-modal-copy">The disk looks old enough to belong in the computer back in Room 01.</p>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function Cabinet({ title, subtitle, accent, onClick, icon }: { title: string; subtitle: string; accent: string; onClick: () => void; icon: string }) {
  return (
    <button className={`arcade-cabinet accent-${accent}`} type="button" onClick={onClick}>
      <span className="cabinet-marquee">{title}</span>
      <span className="cabinet-screen"><i>{icon}</i><small>{subtitle}</small></span>
      <span className="cabinet-controls"><i /><i /><b /></span>
      <span className="cabinet-coin">● INSERT TOKEN</span>
    </button>
  );
}

function ModalHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="arcade-modal-heading">
      <small>{eyebrow}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </header>
  );
}

function PrizeCard({ icon, name, cost, note, disabled, onClick, special = false }: { icon: string; name: string; cost: string; note: string; disabled: boolean; onClick: () => void; special?: boolean }) {
  return (
    <button className={`arcade-prize-card ${special ? "is-special" : ""}`} type="button" disabled={disabled} onClick={onClick}>
      <span>{icon}</span>
      <strong>{name}</strong>
      <small>{note}</small>
      <b>{cost}{/^\d+$/.test(cost) ? " TICKETS" : ""}</b>
    </button>
  );
}

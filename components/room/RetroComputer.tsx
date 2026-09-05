"use client";

import { useMemo, useState } from "react";

type AppName = "home" | "games" | "guess" | "catch" | "fortune" | "memory";
type Card = { id: number; symbol: string; matched: boolean };

const symbols = ["📼", "💿", "☕", "🌙"];

function shuffleCards(): Card[] {
  return [...symbols, ...symbols]
    .map((symbol, id) => ({ id, symbol, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function RetroComputer({ onBack }: { onBack: () => void }) {
  const [app, setApp] = useState<AppName>("home");

  const [guess, setGuess] = useState("");
  const [guessMessage, setGuessMessage] = useState("pick a number from 1 to 20");
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 20) + 1);

  const [score, setScore] = useState(0);
  const [pixelPos, setPixelPos] = useState({ x: 42, y: 48 });

  const [fortuneSeed, setFortuneSeed] = useState(0);

  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [memoryLocked, setMemoryLocked] = useState(false);

  const fortunes = useMemo(
    () => [
      "you will rediscover something you forgot you loved.",
      "a tiny coincidence will feel suspiciously important.",
      "someone will mention a song you were already thinking about.",
      "you are one impulsive idea away from a very good story.",
      "a plan that looks silly on paper may actually be the right one.",
      "the thing you almost deleted is worth keeping.",
      "today has excellent side-quest energy.",
      "something old is about to feel new again.",
    ],
    []
  );

  const luckyObjects = [
    "a forgotten receipt",
    "a green pen",
    "the third song in a playlist",
    "a sticker you nearly threw away",
    "an old screenshot",
    "a coin in the wrong pocket",
    "a half-finished notebook",
  ];

  const warnings = [
    "replying 'sure' when you absolutely mean no",
    "opening one more tab",
    "trusting a 2% battery",
    "re-reading a message twelve times",
    "making important decisions after midnight",
    "saying 'I'll remember it' instead of writing it down",
  ];

  const moods = ["soft chaos", "main-character static", "late-night clarity", "tiny victory", "nostalgic optimism", "side-quest mode"];

  const fortune = useMemo(() => {
    if (fortuneSeed === 0) return null;
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    return {
      omen: pick(fortunes),
      object: pick(luckyObjects),
      warning: pick(warnings),
      mood: pick(moods),
      lucky: Math.floor(Math.random() * 99) + 1,
      luck: Math.floor(Math.random() * 61) + 40,
      chaos: Math.floor(Math.random() * 81) + 20,
      romance: Math.floor(Math.random() * 91) + 10,
      track: String(Math.floor(Math.random() * 12) + 1).padStart(2, "0"),
    };
  }, [fortuneSeed, fortunes]);

  function openApp(next: AppName) {
    if (next === "guess") {
      setTarget(Math.floor(Math.random() * 20) + 1);
      setGuess("");
      setGuessMessage("pick a number from 1 to 20");
    }
    if (next === "catch") {
      setScore(0);
      setPixelPos({ x: 42, y: 48 });
    }
    if (next === "fortune") setFortuneSeed((value) => value + 1);
    if (next === "memory") resetMemory();
    setApp(next);
  }

  function submitGuess() {
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      setGuessMessage("enter a whole number from 1 to 20");
      return;
    }
    if (value === target) {
      setGuessMessage(`ACCESS GRANTED — ${target} was correct! new number loaded.`);
      setTarget(Math.floor(Math.random() * 20) + 1);
      setGuess("");
      return;
    }
    setGuessMessage(value < target ? "too low... try higher" : "too high... try lower");
  }

  function catchPixel() {
    setScore((value) => value + 1);
    setPixelPos({
      x: 8 + Math.floor(Math.random() * 84),
      y: 10 + Math.floor(Math.random() * 78),
    });
  }

  function resetMemory() {
    setCards(shuffleCards());
    setFlipped([]);
    setMoves(0);
    setMemoryLocked(false);
  }

  function flipCard(index: number) {
    if (memoryLocked || cards[index].matched || flipped.includes(index)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((value) => value + 1);
    const [a, b] = next;
    if (cards[a].symbol === cards[b].symbol) {
      setCards((current) => current.map((card, i) => (i === a || i === b ? { ...card, matched: true } : card)));
      setFlipped([]);
    } else {
      setMemoryLocked(true);
      window.setTimeout(() => {
        setFlipped([]);
        setMemoryLocked(false);
      }, 650);
    }
  }

  return (
    <section className="retro-computer-window computer-os" aria-label="Retro computer">
      <div className="computer-window-bar">
        <span>NOSTALGIA OS 95</span>
        <button type="button" onClick={onBack} aria-label="Close computer">×</button>
      </div>

      <div className="computer-window-body computer-desktop">
        {app === "home" && (
          <div className="computer-home-screen">
            <p className="computer-prompt">C:\ROOM\DESKTOP&gt; dir</p>
            <h2>GOOD!<br />things ahead.</h2>
            <p>Welcome to NOSTALGIA OS. Double-clicking is emotionally optional.</p>

            <div className="desktop-icons">
              <button type="button" onClick={() => setApp("home")}><i>♫</i><span>mixes</span></button>
              <button type="button" onClick={() => setApp("home")}><i>✉</i><span>mail</span></button>
              <button type="button" onClick={() => openApp("games")}><i>☻</i><span>games</span></button>
              <button type="button" onClick={() => setApp("home")}><i>▣</i><span>photos</span></button>
            </div>
          </div>
        )}

        {app === "games" && (
          <div className="computer-app-panel games-folder">
            <div className="folder-topline">
              <p className="computer-prompt">C:\ROOM\GAMES&gt; dir</p>
              <button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button>
            </div>
            <h3>GAMES</h3>
            <div className="game-file-grid">
              <button type="button" onClick={() => openApp("guess")}><i>?</i><strong>GUESS.EXE</strong><span>number guesser</span></button>
              <button type="button" onClick={() => openApp("catch")}><i>✦</i><strong>PIXEL.EXE</strong><span>catch the pixel</span></button>
              <button type="button" onClick={() => openApp("fortune")}><i>☾</i><strong>ORACLE.EXE</strong><span>questionable wisdom</span></button>
              <button type="button" onClick={() => openApp("memory")}><i>▦</i><strong>MEMORY.EXE</strong><span>match the pairs</span></button>
            </div>
          </div>
        )}

        {app === "guess" && (
          <div className="computer-app-panel">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\GUESS.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <h3>NUMBER GUESSER</h3>
            <p>I picked a fresh secret number between 1 and 20.</p>
            <div className="guess-controls">
              <input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitGuess()} inputMode="numeric" aria-label="Your number guess" placeholder="1-20" />
              <button type="button" onClick={submitGuess}>ENTER</button>
            </div>
            <div className="computer-status-line">{guessMessage}</div>
          </div>
        )}

        {app === "catch" && (
          <div className="computer-app-panel catch-app">
            <div className="catch-header">
              <div><p className="computer-prompt">C:\GAMES\PIXEL.EXE</p><h3>CATCH THE PIXEL</h3></div>
              <div className="catch-actions"><strong>SCORE {String(score).padStart(2, "0")}</strong><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            </div>
            <p>click the glowing pixel. every hit moves it somewhere random.</p>
            <div className="pixel-field"><button type="button" className="catch-pixel" style={{ left: `${pixelPos.x}%`, top: `${pixelPos.y}%` }} onClick={catchPixel} aria-label="Catch pixel" /></div>
          </div>
        )}

        {app === "fortune" && (
          <div className="computer-app-panel fortune-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\ORACLE.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <h3>ORACLE 2.0</h3>
            <div className="fortune-orb">◎</div>
            {fortune && (
              <div className="fortune-card">
                <p className="fortune-omen">✦ SIGNAL RECEIVED ✦<br /><strong>{fortune.omen}</strong></p>
                <div className="fortune-bars">
                  <span>LUCK <i><b style={{ width: `${fortune.luck}%` }} /></i> {fortune.luck}%</span>
                  <span>CHAOS <i><b style={{ width: `${fortune.chaos}%` }} /></i> {fortune.chaos}%</span>
                  <span>ROMANCE <i><b style={{ width: `${fortune.romance}%` }} /></i> {fortune.romance}%</span>
                </div>
                <div className="fortune-details">
                  <span><b>MOOD</b>{fortune.mood}</span>
                  <span><b>LUCKY NO.</b>{fortune.lucky}</span>
                  <span><b>LUCKY TRACK</b>track {fortune.track}</span>
                  <span><b>LUCKY OBJECT</b>{fortune.object}</span>
                </div>
                <p className="fortune-warning"><b>AVOID:</b> {fortune.warning}</p>
              </div>
            )}
            <button type="button" className="retro-run-button" onClick={() => setFortuneSeed((value) => value + 1)}>RUN AGAIN</button>
          </div>
        )}

        {app === "memory" && (
          <div className="computer-app-panel memory-game-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\MEMORY.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <div className="memory-game-heading"><div><h3>MEMORY MATCH</h3><p>find all four pairs.</p></div><strong>MOVES {String(moves).padStart(2, "0")}</strong></div>
            <div className="memory-grid">
              {cards.map((card, index) => {
                const visible = card.matched || flipped.includes(index);
                return <button key={card.id} type="button" className={`memory-tile ${visible ? "is-open" : ""}`} onClick={() => flipCard(index)} aria-label={visible ? card.symbol : "Hidden card"}>{visible ? card.symbol : "?"}</button>;
              })}
            </div>
            {cards.every((card) => card.matched) && <div className="computer-status-line">ALL PAIRS FOUND — nostalgia restored.</div>}
            <button type="button" className="retro-run-button" onClick={resetMemory}>NEW GAME</button>
          </div>
        )}
      </div>
    </section>
  );
}

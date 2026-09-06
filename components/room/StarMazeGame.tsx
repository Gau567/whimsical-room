"use client";

import { useEffect, useMemo, useState } from "react";

const SIZE = 8;
const WALLS = new Set([3, 4, 11, 17, 19, 20, 26, 27, 29, 35, 37, 43, 44, 50, 52, 53, 59]);
const STAR_CELLS = [9, 31, 46];
const EXIT = 63;

function rc(index: number) {
  return { row: Math.floor(index / SIZE), col: index % SIZE };
}

export default function StarMazeGame({ onBack }: { onBack: () => void }) {
  const [player, setPlayer] = useState(0);
  const [stars, setStars] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const won = player === EXIT && stars.length === STAR_CELLS.length;
  const status = useMemo(() => won ? "EXIT OPEN — YOU ESCAPED THE STAR MAZE." : stars.length < STAR_CELLS.length ? `collect ${STAR_CELLS.length - stars.length} more star${STAR_CELLS.length - stars.length === 1 ? "" : "s"}` : "all stars collected — find the exit", [stars, won]);

  function reset() {
    setPlayer(0);
    setStars([]);
    setMoves(0);
  }

  function move(dr: number, dc: number) {
    if (won) return;
    const { row, col } = rc(player);
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
    const next = nr * SIZE + nc;
    if (WALLS.has(next)) return;
    setPlayer(next);
    setMoves((value) => value + 1);
    if (STAR_CELLS.includes(next) && !stars.includes(next)) setStars((current) => [...current, next]);
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowUp") { event.preventDefault(); move(-1, 0); }
      if (event.key === "ArrowDown") { event.preventDefault(); move(1, 0); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(0, -1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(0, 1); }
      if (event.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [player, stars, won]);

  return (
    <div className="computer-app-panel starmaze-app">
      <div className="folder-topline"><p className="computer-prompt">C:\GAMES\STARMAZE.EXE</p><button type="button" className="retro-small-button" onClick={onBack}>← GAMES</button></div>
      <div className="memory-game-heading"><div><h3>STAR MAZE</h3><p>collect all three stars, then reach the exit.</p></div><strong>MOVES {String(moves).padStart(2, "0")}</strong></div>
      <div className="starmaze-board" role="grid" aria-label="Star maze">
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const isWall = WALLS.has(index);
          const isPlayer = index === player;
          const isStar = STAR_CELLS.includes(index) && !stars.includes(index);
          const isExit = index === EXIT;
          return <div key={index} className={`maze-cell ${isWall ? "wall" : ""} ${isExit ? "exit" : ""}`}>{isPlayer ? "▲" : isStar ? "✦" : isExit ? "▣" : ""}</div>;
        })}
      </div>
      <div className="maze-status">{status}</div>
      <div className="maze-controls">
        <span />
        <button type="button" onClick={() => move(-1, 0)}>↑</button>
        <span />
        <button type="button" onClick={() => move(0, -1)}>←</button>
        <button type="button" onClick={() => move(1, 0)}>↓</button>
        <button type="button" onClick={() => move(0, 1)}>→</button>
      </div>
      <button type="button" className="retro-run-button" onClick={reset}>RESTART [R]</button>
    </div>
  );
}

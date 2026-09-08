"use client";

import Backpack from "./Backpack";
import QuestLog from "./QuestLog";
import WorldMusicControl from "./WorldMusicControl";
import { useWorld } from "@/lib/world/WorldContext";

export default function WorldHUD() {
  const { currentRoom } = useWorld();

  return (
    <aside className="world-hud" aria-label="World controls">
      <div className="world-hud-left">
        <Backpack />
        <QuestLog />
      </div>

      {currentRoom !== "nostalgia" && (
        <div className="world-hud-music">
          <WorldMusicControl />
        </div>
      )}
    </aside>
  );
}

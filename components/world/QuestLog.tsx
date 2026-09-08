"use client";

import { useMemo, useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";
import { WORLD_QUESTS } from "@/lib/world/worldQuests";
import type { QuestId } from "@/lib/world/worldTypes";

export default function QuestLog() {
  const [open, setOpen] = useState(false);
  const {
    inventory,
    discoveredClues,
    completedQuests,
    hasItem,
    hasClue,
  } = useWorld();

  const visibleQuestIds = useMemo<QuestId[]>(() => {
    const ids: QuestId[] = ["study-locked-drawer"];

    if (hasItem("telescope-lens") || hasClue("observatory-lens-found")) {
      ids.push("observatory-missing-lens");
    }
    if (hasClue("train-platform-seven")) {
      ids.push("train-eleven-forty-seven");
    }
    if (hasItem("small-brass-key") || hasClue("greenhouse-key-found")) {
      ids.push("greenhouse-small-key");
    }

    return ids;
  }, [inventory, discoveredClues, hasItem, hasClue]);

  const visibleQuests = WORLD_QUESTS.filter((quest) =>
    visibleQuestIds.includes(quest.id),
  );

  const activeCount = visibleQuests.filter(
    (quest) => !completedQuests.includes(quest.id),
  ).length;

  return (
    <>
      <button
        type="button"
        className="world-quest-button"
        onClick={() => setOpen(true)}
        aria-label={`Open quest log, ${activeCount} active quests`}
      >
        <span aria-hidden="true">✦</span>
        <strong>QUESTS</strong>
        <small>{activeCount}</small>
      </button>

      {open && (
        <div className="world-quest-backdrop" onMouseDown={() => setOpen(false)}>
          <section
            className="world-quest-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Quest log"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="world-quest-close"
              onClick={() => setOpen(false)}
              aria-label="Close quest log"
            >
              ×
            </button>

            <header>
              <small>WORLD NOTES</small>
              <h2>Quest Log</h2>
              <p>things that seem important enough not to lose</p>
            </header>

            <div className="world-quest-list">
              {visibleQuests.map((quest) => {
                const complete = completedQuests.includes(quest.id);
                return (
                  <article
                    key={quest.id}
                    className={`world-quest-card ${complete ? "is-complete" : "is-active"}`}
                  >
                    <div className="world-quest-status" aria-hidden="true">
                      {complete ? "✓" : "○"}
                    </div>
                    <div>
                      <small>{quest.room.toUpperCase()}</small>
                      <h3>{quest.title}</h3>
                      <p>{quest.hint}</p>
                      <em>{complete ? "completed" : "active"}</em>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

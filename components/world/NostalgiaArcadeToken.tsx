"use client";

import { useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

export default function NostalgiaArcadeToken() {
  const { hasItem, addItem, unlockRoom, discoverClue } = useWorld();
  const [open, setOpen] = useState(false);
  const [collectedNow, setCollectedNow] = useState(false);

  if (hasItem("old-arcade-token") && !collectedNow) return null;

  function collect() {
    if (!hasItem("old-arcade-token")) {
      addItem({
        id: "old-arcade-token",
        name: "Old Arcade Token",
        icon: "◎",
        description:
          'A worn brass token. One side reads "PLAYER ONE"; the edge says NEON CLOVER.',
        sourceRoom: "nostalgia",
        useIn: "arcade",
      });

      discoverClue("nostalgia-arcade-token");
      unlockRoom("arcade");
    }

    setCollectedNow(true);
    setOpen(false);
  }

  if (collectedNow) {
    return (
      <div className="nostalgia-arcade-token-toast">
        <span>◎</span>
        <div>
          <strong>ARCADE TOKEN COLLECTED</strong>
          <small>somewhere in the hallway, a cyan sign flickers on.</small>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="nostalgia-arcade-token-hotspot"
        onClick={() => setOpen(true)}
        aria-label="Inspect the small glint beneath the desk"
      >
        <span className="nostalgia-token-glint">✦</span>
        <span className="nostalgia-token-coin">◎</span>
        <small>something under the desk...</small>
      </button>

      {open && (
        <div className="nostalgia-token-backdrop">
          <section className="nostalgia-token-card">
            <button
              className="nostalgia-token-close"
              type="button"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <p>FOUND UNDER THE DESK</p>

            <div className="nostalgia-token-large">
              <span>PLAYER</span>
              <strong>1</strong>
              <small>NEON CLOVER</small>
            </div>

            <h2>Old Arcade Token</h2>
            <p>
              The brass has gone dull with age. A tiny joystick is scratched
              into the reverse side.
            </p>

            <div className="nostalgia-token-reverse">
              INSERT COIN · PLAYER ONE
            </div>

            <button
              className="nostalgia-token-collect"
              type="button"
              onClick={collect}
            >
              TAKE ARCADE TOKEN
            </button>
          </section>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useWorld } from "@/lib/world/WorldContext";

export default function Backpack() {
  const [open, setOpen] = useState(false);
  const { inventory } = useWorld();

  return (
    <>
      <button
        type="button"
        className="world-backpack-button"
        onClick={() => setOpen(true)}
        aria-label={`Open backpack, ${inventory.length} items`}
      >
        <span aria-hidden="true">🎒</span>
        <strong>BACKPACK</strong>
        <small>{inventory.length}</small>
      </button>

      {open && (
        <div className="world-backpack-backdrop" onMouseDown={() => setOpen(false)}>
          <section
            className="world-backpack-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Backpack"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="world-backpack-close"
              onClick={() => setOpen(false)}
              aria-label="Close backpack"
            >
              ×
            </button>

            <header>
              <small>WORLD INVENTORY</small>
              <h2>Your Backpack</h2>
              <p>things worth carrying between rooms</p>
            </header>

            {inventory.length === 0 ? (
              <div className="world-backpack-empty">
                <span>◌</span>
                <p>Nothing yet.</p>
                <small>Rooms tend to leave useful things in inconvenient places.</small>
              </div>
            ) : (
              <div className="world-backpack-grid">
                {inventory.map((item) => (
                  <article key={item.id} className="world-backpack-item">
                    <span className="world-backpack-item-icon">{item.icon}</span>
                    <div>
                      <small>{item.sourceRoom.toUpperCase()}</small>
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      {item.useIn && <em>probably useful in: {item.useIn}</em>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

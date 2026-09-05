"use client";

import { useEffect, useMemo, useState } from "react";

type PinItem = {
  id: string;
  type: "note" | "photo";
  text?: string;
  caption?: string;
  color?: string;
  createdAt: number;
};

const STORAGE_KEY = "nostalgia-pinboard-items";

function loadItems(): PinItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PinItem[]) : [];
  } catch {
    return [];
  }
}

export default function MiniTypewriter({ onOpenBoard }: { onOpenBoard: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("paper loaded");
  const [typedCount, setTypedCount] = useState(0);
  const maxChars = 260;

  useEffect(() => {
    const savedDraft = window.localStorage.getItem("nostalgia-typewriter-draft");
    if (savedDraft) setText(savedDraft);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("nostalgia-typewriter-draft", text);
  }, [text]);

  const lines = useMemo(() => Math.max(1, Math.ceil(text.length / 34)), [text]);

  function typeChange(value: string) {
    setText(value.slice(0, maxChars));
    setTypedCount((count) => count + 1);
    setStatus("clack · clack · ding");
  }

  function tearPaper() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("type something first");
      return;
    }

    const items = loadItems();
    const next: PinItem[] = [
      ...items,
      {
        id: `note-${Date.now()}`,
        type: "note",
        text: trimmed,
        color: ["#f2df9f", "#e8c8b4", "#c9d8cf", "#d4c8e8"][items.length % 4],
        createdAt: Date.now(),
      },
    ];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.localStorage.removeItem("nostalgia-typewriter-draft");
    window.dispatchEvent(new Event("nostalgia-pinboard-updated"));
    setText("");
    setStatus("paper torn out + pinned ✓");
  }

  function clearPaper() {
    setText("");
    window.localStorage.removeItem("nostalgia-typewriter-draft");
    setStatus("fresh sheet loaded");
  }

  return (
    <div className="typewriter-workspace">
      <div className="typewriter-toolbar">
        <div>
          <p>WRITING DESK</p>
          <h2>Remington-ish 95</h2>
        </div>
        <div className="typewriter-toolbar-actions">
          <button type="button" onClick={onOpenBoard}>📌 PIN BOARD</button>
          <button type="button" onClick={clearPaper}>NEW SHEET</button>
          <button type="button" className="tear-button" onClick={tearPaper}>TEAR + PIN</button>
        </div>
      </div>

      <div className="typewriter-stage">
        <div className="typewriter-paper-wrap" style={{ transform: `translateY(${Math.min(lines * 2, 18)}px)` }}>
          <div className="typewriter-paper-shadow" />
          <textarea
            className="typewriter-paper"
            value={text}
            onChange={(event) => typeChange(event.target.value)}
            placeholder="type a note, a lyric, a tiny thought..."
            aria-label="Typewriter paper"
          />
          <span className="paper-count">{text.length}/{maxChars}</span>
        </div>

        <div className="typewriter-machine" aria-hidden="true">
          <div className="tw-carriage">
            <span className="tw-knob tw-knob-left" />
            <span className="tw-rail" />
            <span className="tw-knob tw-knob-right" />
            <span className="tw-return-lever" />
          </div>

          <div className="tw-ribbon-cover">
            <span className="tw-spool tw-spool-left"><i /></span>
            <span className="tw-ribbon" />
            <span className="tw-spool tw-spool-right"><i /></span>
            <span className="tw-type-guide">⌄</span>
          </div>

          <div className="tw-body">
            <div className="tw-keybed">
              {"QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((letter, index) => (
                <span key={`${letter}-${index}`} className="tw-key">{letter}</span>
              ))}
              <span className="tw-key tw-key-wide">SHIFT</span>
              <span className="tw-spacebar" />
              <span className="tw-key tw-key-wide">RETURN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="typewriter-status">
        <span>{status}</span>
        <small>{typedCount ? `${typedCount} key strokes this session` : "waiting for your first line..."}</small>
      </div>
    </div>
  );
}

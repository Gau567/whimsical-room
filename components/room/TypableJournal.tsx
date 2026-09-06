"use client";

import { useEffect, useState } from "react";
import { addPinboardItem } from "@/lib/pinboard";

const DEFAULT_LEFT =
  "Some songs become places. Some photos become entire afternoons. This is where the little things live when you do not want them to disappear.";
const DEFAULT_RIGHT =
  "play this when the room feels a little too quiet.";

export default function TypableJournal({
  onOpenBooks,
  onOpenBoard,
}: {
  onOpenBooks: () => void;
  onOpenBoard: () => void;
}) {
  const [title, setTitle] = useState("things worth remembering");
  const [leftText, setLeftText] = useState(DEFAULT_LEFT);
  const [rightText, setRightText] = useState(DEFAULT_RIGHT);
  const [saved, setSaved] = useState(false);
  const [tearing, setTearing] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("nostalgia-journal");
      if (!raw) return;
      const data = JSON.parse(raw) as { title?: string; leftText?: string; rightText?: string };
      if (data.title) setTitle(data.title);
      if (data.leftText) setLeftText(data.leftText);
      if (data.rightText) setRightText(data.rightText);
    } catch {
      // Keep defaults if stored data is malformed.
    }
  }, []);

  function saveJournal() {
    window.localStorage.setItem("nostalgia-journal", JSON.stringify({ title, leftText, rightText }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1300);
  }

  function clearJournal() {
    setTitle("");
    setLeftText("");
    setRightText("");
  }

  function tearToBoard(side: "left" | "right") {
    const text = side === "left" ? leftText.trim() : rightText.trim();
    if (!text) return;
    setTearing(side);
    window.setTimeout(() => {
      addPinboardItem({
        type: "journal",
        text: side === "left" ? `${title || "untitled"}\n\n${text}` : text,
        color: side === "left" ? "#efe3c6" : "#f3e8cf",
        font: side === "right" ? "hand" : "type",
        source: "journal",
        rotation: side === "left" ? -2 : 2,
      });
      setTearing(null);
      onOpenBoard();
    }, 520);
  }

  return (
    <div className="journal-workspace journal-workspace-v11">
      <div className="journal-toolbar">
        <span>MY JOURNAL</span>
        <div>
          <button type="button" onClick={onOpenBooks}>📚 READ BOOKS</button>
          <button type="button" onClick={clearJournal}>CLEAR</button>
          <button type="button" className="journal-save" onClick={saveJournal}>{saved ? "SAVED ✓" : "SAVE"}</button>
        </div>
      </div>

      <div className="journal-tear-tools">
        <span>tear a page out and pin it</span>
        <button type="button" onClick={() => tearToBoard("left")} disabled={!leftText.trim()}>✂ TEAR LEFT PAGE</button>
        <button type="button" onClick={() => tearToBoard("right")} disabled={!rightText.trim()}>✂ TEAR RIGHT NOTE</button>
      </div>

      <div className="open-journal retro-journal editable-journal">
        <div className={`journal-page journal-left-page ${tearing === "left" ? "journal-page-tearing-left" : ""}`}>
          <p className="journal-date">SEPTEMBER</p>
          <input className="journal-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="give this page a title..." aria-label="Journal title" />
          <textarea className="journal-writing-area journal-writing-left" value={leftText} onChange={(event) => setLeftText(event.target.value)} placeholder="type whatever you want to remember here..." aria-label="Journal left page" />
          <span className="journal-doodle">✦ &nbsp; ☾ &nbsp; ♫ &nbsp; ♡</span>
          <div className="journal-ticket">ADMIT ONE · GOOD MEMORIES</div>
        </div>

        <div className={`journal-page journal-right-page ${tearing === "right" ? "journal-page-tearing-right" : ""}`}>
          <div className="journal-photo retro-journal-photo"><span>drop a photo here someday ♡</span></div>
          <textarea className="journal-writing-area journal-writing-right" value={rightText} onChange={(event) => setRightText(event.target.value)} placeholder="a quote, lyric, note, secret..." aria-label="Journal right page" />
          <div className="journal-tape">for later</div>
          <div className="journal-sticker">☺</div>
        </div>
      </div>

      <p className="journal-save-note">SAVE keeps the journal here. TEAR OUT makes a copy for the pinboard — your journal text stays intact.</p>
    </div>
  );
}

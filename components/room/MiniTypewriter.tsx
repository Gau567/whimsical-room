"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type FontMode = "type" | "hand";

type PinItem = {
  id: string;
  type: "note" | "photo";
  text?: string;
  caption?: string;
  color?: string;
  createdAt: number;
  x?: number;
  y?: number;
  rotation?: number;
  font?: FontMode;
};

const STORAGE_KEY = "nostalgia-pinboard-items";
const DRAFT_KEY = "nostalgia-typewriter-draft";
const FONT_KEY = "nostalgia-typewriter-font";
const SOUND_KEY = "nostalgia-typewriter-sound";
const MAX_CHARS = 260;
const KEY_RELEASE_MS = 85;

const LETTER_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

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
  const [fontMode, setFontMode] = useState<FontMode>("type");
  const [soundOn, setSoundOn] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [shiftOn, setShiftOn] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [paperSerial, setPaperSerial] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const tearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(DRAFT_KEY);
    if (savedDraft) setText(savedDraft);

    const savedFont = window.localStorage.getItem(FONT_KEY);
    if (savedFont === "type" || savedFont === "hand") setFontMode(savedFont);

    const savedSound = window.localStorage.getItem(SOUND_KEY);
    if (savedSound === "off") setSoundOn(false);

    return () => {
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
      if (tearTimerRef.current) clearTimeout(tearTimerRef.current);
      audioRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, text);
  }, [text]);

  useEffect(() => {
    window.localStorage.setItem(FONT_KEY, fontMode);
  }, [fontMode]);

  useEffect(() => {
    window.localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
  }, [soundOn]);

  const lines = useMemo(() => Math.max(1, Math.ceil(Math.max(text.length, 1) / 34)), [text]);
  const currentLineLength = useMemo(() => text.split("\n").at(-1)?.length ?? 0, [text]);
  const carriageShift = Math.min(currentLineLength, 32) * -0.7;

  function getAudioContext() {
    if (typeof window === "undefined") return null;
    if (audioRef.current) return audioRef.current;

    const WebkitAudioContext = (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;
    const AudioContextCtor = window.AudioContext || WebkitAudioContext;
    if (!AudioContextCtor) return null;

    audioRef.current = new AudioContextCtor();
    return audioRef.current;
  }

  function playClack(variant = 0) {
    if (!soundOn) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = variant % 2 ? "triangle" : "square";
    oscillator.frequency.setValueAtTime(135 + (variant % 5) * 17 + Math.random() * 18, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.055);
  }

  function playBell() {
    if (!soundOn) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    [1120, 1670].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.055 : 0.025, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.45);
    });
  }

  function playTear() {
    if (!soundOn) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const duration = 0.42;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const fade = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * fade * (0.55 + Math.random() * 0.35);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 1450;
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  function pulseKey(key: string) {
    setActiveKey(key);
    if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
    keyTimerRef.current = setTimeout(() => setActiveKey(null), KEY_RELEASE_MS);
  }

  function updateText(next: string) {
    const safe = next.slice(0, MAX_CHARS);
    setText(safe);
    setStatus("clack · clack");
  }

  function insertAtCursor(value: string) {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}${value}${text.slice(end)}`.slice(0, MAX_CHARS);
    setText(next);
    setTypedCount((count) => count + 1);
    setStatus(value === "\n" ? "ding · carriage return" : "clack · clack");

    requestAnimationFrame(() => {
      if (!textarea) return;
      const cursor = Math.min(start + value.length, next.length);
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function removeAtCursor() {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? text.length;
    const end = textarea?.selectionEnd ?? text.length;
    if (start === 0 && end === 0) return;

    const from = start === end ? Math.max(0, start - 1) : start;
    const next = `${text.slice(0, from)}${text.slice(end)}`;
    setText(next);
    setTypedCount((count) => count + 1);
    setStatus("clack · backspace");

    requestAnimationFrame(() => {
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(from, from);
    });
  }

  function pressLetter(letter: string) {
    const value = shiftOn ? letter.toUpperCase() : letter.toLowerCase();
    pulseKey(letter);
    playClack(letter.charCodeAt(0));
    insertAtCursor(value);
    if (shiftOn) setShiftOn(false);
  }

  function pressSpace() {
    pulseKey("SPACE");
    playClack(3);
    insertAtCursor(" ");
  }

  function pressReturn() {
    pulseKey("RETURN");
    playClack(7);
    playBell();
    insertAtCursor("\n");
  }

  function pressBackspace() {
    pulseKey("BACKSPACE");
    playClack(1);
    removeAtCursor();
  }

  function handlePhysicalKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (/^[a-zA-Z]$/.test(event.key)) {
      pulseKey(event.key.toUpperCase());
      playClack(event.key.toUpperCase().charCodeAt(0));
      setTypedCount((count) => count + 1);
      return;
    }

    if (event.key === " ") {
      pulseKey("SPACE");
      playClack(3);
      setTypedCount((count) => count + 1);
      return;
    }

    if (event.key === "Enter") {
      pulseKey("RETURN");
      playClack(7);
      playBell();
      setTypedCount((count) => count + 1);
      return;
    }

    if (event.key === "Backspace") {
      pulseKey("BACKSPACE");
      playClack(1);
      setTypedCount((count) => count + 1);
      return;
    }

    if (event.key === "Shift") pulseKey("SHIFT");
  }

  function finishTear(trimmed: string) {
    const items = loadItems();
    const next: PinItem[] = [
      ...items,
      {
        id: `note-${Date.now()}`,
        type: "note",
        text: trimmed,
        color: ["#f2df9f", "#e8c8b4", "#c9d8cf", "#d4c8e8"][items.length % 4],
        createdAt: Date.now(),
        x: 38 + ((items.length % 3) * 11),
        y: 16 + ((items.length % 4) * 12),
        rotation: ((items.length % 5) - 2) * 1.5,
        font: fontMode,
      },
    ];

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.localStorage.removeItem(DRAFT_KEY);
    window.dispatchEvent(new Event("nostalgia-pinboard-updated"));
    setText("");
    setPaperSerial((serial) => serial + 1);
    setIsTearing(false);
    setStatus("paper torn out + pinned ✓");
  }

  function tearPaper() {
    const trimmed = text.trim();
    if (!trimmed) {
      setStatus("type something first");
      return;
    }
    if (isTearing) return;

    setIsTearing(true);
    setStatus("rrrip — sending it to the pin board...");
    playTear();
    tearTimerRef.current = setTimeout(() => finishTear(trimmed), 720);
  }

  function clearPaper() {
    if (isTearing) return;
    setText("");
    window.localStorage.removeItem(DRAFT_KEY);
    setPaperSerial((serial) => serial + 1);
    setStatus("fresh sheet loaded");
    textareaRef.current?.focus();
  }

  function toggleFont() {
    setFontMode((current) => (current === "type" ? "hand" : "type"));
    setStatus(fontMode === "type" ? "handwritten ribbon selected" : "classic typeface selected");
  }

  return (
    <div className="typewriter-workspace typewriter-workspace-v9">
      <div className="typewriter-toolbar">
        <div>
          <p>WRITING DESK</p>
          <h2>Remington-ish 95</h2>
          <small className="typewriter-toolbar-note">keyboard + clickable keys both work</small>
        </div>
        <div className="typewriter-toolbar-actions">
          <button type="button" onClick={toggleFont}>FONT: {fontMode === "type" ? "TYPE" : "HAND"}</button>
          <button type="button" onClick={() => setSoundOn((value) => !value)}>SOUND: {soundOn ? "ON" : "OFF"}</button>
          <button type="button" onClick={onOpenBoard}>📌 PIN BOARD</button>
          <button type="button" onClick={clearPaper} disabled={isTearing}>NEW SHEET</button>
          <button type="button" className="tear-button" onClick={tearPaper} disabled={isTearing}>
            {isTearing ? "TEARING..." : "TEAR + PIN"}
          </button>
        </div>
      </div>

      <div className={`typewriter-stage ${isTearing ? "is-tearing" : ""}`}>
        <div
          key={paperSerial}
          className={`typewriter-paper-wrap ${isTearing ? "paper-tearing" : "paper-loaded"}`}
          style={{
            top: `${26 + Math.min(lines * 2, 18)}px`,
            marginLeft: `${carriageShift}px`,
          }}
        >
          <div className="typewriter-paper-shadow" />
          <textarea
            ref={textareaRef}
            className={`typewriter-paper font-${fontMode}`}
            value={text}
            onChange={(event) => updateText(event.target.value)}
            onKeyDown={handlePhysicalKey}
            placeholder="type a note, a lyric, a tiny thought..."
            aria-label="Typewriter paper"
            maxLength={MAX_CHARS}
            spellCheck={false}
          />
          <span className="paper-count">{text.length}/{MAX_CHARS}</span>
          <span className="paper-tear-edge" aria-hidden="true" />
        </div>

        <div className="typewriter-machine">
          <div className={`tw-carriage ${activeKey === "RETURN" ? "carriage-returning" : ""}`} aria-hidden="true">
            <span className="tw-knob tw-knob-left" />
            <span className="tw-rail" />
            <span className="tw-knob tw-knob-right" />
            <span className="tw-return-lever" />
          </div>

          <div className="tw-ribbon-deck" aria-hidden="true">
            <span className="tw-spool tw-spool-left"><i /></span>
            <span className="tw-ribbon" />
            <span className="tw-spool tw-spool-right"><i /></span>
            <span className={`tw-type-basket ${activeKey ? "basket-strike" : ""}`} />
            <span className="tw-paper-guide tw-paper-guide-left" />
            <span className="tw-paper-guide tw-paper-guide-right" />
          </div>

          <div className="tw-body">
            <div className="tw-brand">NOSTALGIA</div>
            <div className="tw-keybed" aria-label="Clickable typewriter keyboard">
              {LETTER_ROWS.map((row, rowIndex) => (
                <div key={row} className={`tw-key-row tw-row-${["one", "two", "three"][rowIndex]}`}>
                  {row.split("").map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      className={`tw-key ${activeKey === letter ? "is-pressed" : ""}`}
                      onClick={() => pressLetter(letter)}
                      aria-label={`Type ${letter}`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              ))}

              <div className="tw-punctuation-row">
                {[".", ",", "?", "!", "'"] .map((mark) => (
                  <button
                    key={mark}
                    type="button"
                    className={`tw-key tw-key-small ${activeKey === mark ? "is-pressed" : ""}`}
                    onClick={() => {
                      pulseKey(mark);
                      playClack(mark.charCodeAt(0));
                      insertAtCursor(mark);
                    }}
                    aria-label={`Type ${mark}`}
                  >
                    {mark}
                  </button>
                ))}
              </div>

              <div className="tw-bottom-row">
                <button
                  type="button"
                  className={`tw-key tw-key-wide ${shiftOn ? "shift-latched" : ""} ${activeKey === "SHIFT" ? "is-pressed" : ""}`}
                  onClick={() => {
                    pulseKey("SHIFT");
                    playClack(2);
                    setShiftOn((value) => !value);
                    textareaRef.current?.focus();
                  }}
                >
                  SHIFT
                </button>
                <button
                  type="button"
                  className={`tw-spacebar ${activeKey === "SPACE" ? "is-pressed" : ""}`}
                  onClick={pressSpace}
                  aria-label="Type a space"
                >
                  SPACE
                </button>
                <button
                  type="button"
                  className={`tw-key tw-key-wide ${activeKey === "BACKSPACE" ? "is-pressed" : ""}`}
                  onClick={pressBackspace}
                >
                  BACK
                </button>
                <button
                  type="button"
                  className={`tw-key tw-key-wide ${activeKey === "RETURN" ? "is-pressed" : ""}`}
                  onClick={pressReturn}
                >
                  RETURN
                </button>
              </div>
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

"use client";

import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";

type PinItem = {
  id: string;
  type: "note" | "photo";
  text?: string;
  caption?: string;
  color?: string;
  image?: string;
  createdAt: number;
  x?: number;
  y?: number;
  rotation?: number;
};

const STORAGE_KEY = "nostalgia-pinboard-items";

const STARTER_ITEMS: PinItem[] = [
  {
    id: "starter-photo-1",
    type: "photo",
    caption: "somewhere worth going back to",
    color: "linear-gradient(145deg,#6b73ad,#d56d9c 55%,#f1a16f)",
    createdAt: 1,
    x: 9,
    y: 12,
    rotation: -4,
  },
  {
    id: "starter-note-1",
    type: "note",
    text: "remember to make a playlist for rainy evenings",
    color: "#efd995",
    createdAt: 2,
    x: 40,
    y: 9,
    rotation: 3,
  },
  {
    id: "starter-photo-2",
    type: "photo",
    caption: "late afternoon",
    color: "linear-gradient(145deg,#497688,#e6a26e 70%)",
    createdAt: 3,
    x: 66,
    y: 42,
    rotation: 5,
  },
];

function defaultPlacement(index: number) {
  const placements = [
    { x: 8, y: 10 },
    { x: 39, y: 11 },
    { x: 68, y: 12 },
    { x: 13, y: 48 },
    { x: 43, y: 49 },
    { x: 70, y: 50 },
    { x: 26, y: 30 },
    { x: 57, y: 29 },
  ];
  return placements[index % placements.length];
}

function normalizeItems(items: PinItem[]): PinItem[] {
  return items.map((item, index) => {
    const fallback = defaultPlacement(index);
    return {
      ...item,
      x: typeof item.x === "number" ? item.x : fallback.x,
      y: typeof item.y === "number" ? item.y : fallback.y,
      rotation: typeof item.rotation === "number" ? item.rotation : ((index % 5) - 2) * 2,
    };
  });
}

function loadItems(): PinItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER_ITEMS;
    return normalizeItems(JSON.parse(raw) as PinItem[]);
  } catch {
    return STARTER_ITEMS;
  }
}

export default function PinBoard({ onOpenTypewriter }: { onOpenTypewriter: () => void }) {
  const [items, setItems] = useState<PinItem[]>([]);
  const [newNote, setNewNote] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  function refresh() {
    const loaded = loadItems();
    setItems(loaded);
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    }
  }

  useEffect(() => {
    refresh();
    const listener = () => refresh();
    window.addEventListener("nostalgia-pinboard-updated", listener);
    return () => window.removeEventListener("nostalgia-pinboard-updated", listener);
  }, []);

  function save(next: PinItem[]) {
    const normalized = normalizeItems(next);
    setItems(normalized);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event("nostalgia-pinboard-updated"));
  }

  function nextPlacement() {
    return defaultPlacement(items.length);
  }

  function addQuickNote() {
    const text = newNote.trim();
    if (!text) return;
    const placement = nextPlacement();
    save([
      ...items,
      {
        id: `quick-note-${Date.now()}`,
        type: "note",
        text,
        color: ["#f2df9f", "#e8c8b4", "#c9d8cf", "#d4c8e8"][items.length % 4],
        createdAt: Date.now(),
        ...placement,
        rotation: ((items.length % 5) - 2) * 1.5,
      },
    ]);
    setNewNote("");
  }

  function addPhoto() {
    const caption = photoCaption.trim() || "untitled memory";
    const gradients = [
      "linear-gradient(145deg,#6f68a9,#d4689f 55%,#f0a06a)",
      "linear-gradient(145deg,#4b7d8d,#df9b6d 65%)",
      "linear-gradient(145deg,#815f82,#6f8caf 55%,#d5a16d)",
      "linear-gradient(145deg,#5f7f6b,#c68c67 70%)",
    ];
    const placement = nextPlacement();
    save([
      ...items,
      {
        id: `photo-${Date.now()}`,
        type: "photo",
        caption,
        color: gradients[items.length % gradients.length],
        createdAt: Date.now(),
        ...placement,
        rotation: ((items.length % 5) - 2) * 1.7,
      },
    ]);
    setPhotoCaption("");
  }

  function uploadPhoto(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      window.alert("Pick an image under 1.5 MB so the board can save it locally.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "";
      if (!image) return;
      const placement = nextPlacement();
      save([
        ...items,
        {
          id: `upload-${Date.now()}`,
          type: "photo",
          caption: photoCaption.trim() || file.name.replace(/\.[^.]+$/, ""),
          image,
          createdAt: Date.now(),
          ...placement,
          rotation: ((items.length % 5) - 2) * 1.5,
        },
      ]);
      setPhotoCaption("");
    };
    reader.readAsDataURL(file);
  }

  function removeItem(id: string) {
    save(items.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function beginEdit(item: PinItem) {
    setEditingId(item.id);
    setEditingText(item.type === "note" ? item.text || "" : item.caption || "");
  }

  function saveEdit() {
    if (!editingId) return;
    const value = editingText.trim();
    if (!value) return;
    save(
      items.map((item) =>
        item.id === editingId
          ? item.type === "note"
            ? { ...item, text: value }
            : { ...item, caption: value }
          : item,
      ),
    );
    setEditingId(null);
  }

  function nudgeItem(id: string, dx: number, dy: number) {
    save(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              x: Math.max(1, Math.min(82, (item.x ?? 0) + dx)),
              y: Math.max(1, Math.min(72, (item.y ?? 0) + dy)),
            }
          : item,
      ),
    );
  }

  function rotateItem(id: string) {
    save(
      items.map((item) =>
        item.id === id
          ? { ...item, rotation: ((item.rotation ?? 0) + 4) > 8 ? -8 : (item.rotation ?? 0) + 4 }
          : item,
      ),
    );
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>, item: PinItem) {
    if (!boardRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    dragRef.current = {
      id: item.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: item.x ?? 0,
      startY: item.y ?? 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const rect = board.getBoundingClientRect();
    const dx = ((event.clientX - drag.startClientX) / rect.width) * 100;
    const dy = ((event.clientY - drag.startClientY) / rect.height) * 100;
    setItems((current) =>
      current.map((item) =>
        item.id === drag.id
          ? {
              ...item,
              x: Math.max(1, Math.min(82, drag.startX + dx)),
              y: Math.max(1, Math.min(72, drag.startY + dy)),
            }
          : item,
      ),
    );
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function resetBoard() {
    if (!window.confirm("Reset the board to its starter notes and photos?")) return;
    save(STARTER_ITEMS);
  }

  const noteCount = useMemo(() => items.filter((item) => item.type === "note").length, [items]);
  const editingItem = items.find((item) => item.id === editingId) ?? null;

  return (
    <div className="pinboard-workspace pinboard-workspace-v8">
      <div className="pinboard-toolbar">
        <div>
          <p>ROOM PIN BOARD</p>
          <h2>move things around until they feel right</h2>
          <small>drag any note or photo · click edit to rewrite it</small>
        </div>
        <div className="pinboard-toolbar-actions">
          <button type="button" onClick={onOpenTypewriter}>⌨ TYPE A NOTE</button>
          <button type="button" className="board-reset-button" onClick={resetBoard}>RESET BOARD</button>
        </div>
      </div>

      <div className="cork-board cork-board-v8" ref={boardRef}>
        <div className="board-string string-one" />
        <div className="board-string string-two" />
        {items.map((item) => (
          <article
            key={item.id}
            className={`pinned-item pinned-${item.type} pinned-item-v8`}
            style={{
              left: `${item.x ?? 0}%`,
              top: `${item.y ?? 0}%`,
              transform: `rotate(${item.rotation ?? 0}deg)`,
              zIndex: editingId === item.id ? 20 : undefined,
            }}
            onPointerDown={(event) => handlePointerDown(event, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { dragRef.current = null; }}
          >
            <span className="push-pin" />
            {item.type === "note" ? (
              <div className="sticky-note" style={{ background: item.color || "#f0dd9e" }}>
                <p>{item.text}</p>
              </div>
            ) : (
              <div className="pinned-polaroid">
                {item.image ? (
                  <img className="pin-photo pin-photo-image" src={item.image} alt={item.caption || "Pinned memory"} />
                ) : (
                  <span className="pin-photo" style={{ background: item.color }} />
                )}
                <small>{item.caption}</small>
              </div>
            )}

            <div className="pin-item-actions" aria-label="Pin controls">
              <button type="button" onClick={() => beginEdit(item)}>edit</button>
              <button type="button" onClick={() => rotateItem(item.id)} aria-label="Rotate item">↻</button>
              <button type="button" className="pin-remove" onClick={() => removeItem(item.id)} aria-label="Remove pinned item">×</button>
            </div>
          </article>
        ))}
      </div>

      <div className="pinboard-add-bar pinboard-add-bar-v8">
        <div className="pinboard-add-note">
          <label htmlFor="quick-note">quick sticky note</label>
          <input
            id="quick-note"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value.slice(0, 120))}
            onKeyDown={(event) => { if (event.key === "Enter") addQuickNote(); }}
            placeholder="don't forget..."
          />
          <button type="button" onClick={addQuickNote}>PIN NOTE</button>
        </div>

        <div className="pinboard-add-photo">
          <label htmlFor="photo-caption">photo / memory card</label>
          <input
            id="photo-caption"
            value={photoCaption}
            onChange={(event) => setPhotoCaption(event.target.value.slice(0, 70))}
            placeholder="caption..."
          />
          <button type="button" onClick={addPhoto}>MAKE CARD</button>
          <label className="photo-upload-button">
            UPLOAD PHOTO
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                uploadPhoto(event.target.files?.[0] ?? null);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <small>{noteCount} note{noteCount === 1 ? "" : "s"} · positions saved locally</small>
      </div>

      {editingItem && (
        <div className="pin-editor-backdrop" onClick={() => setEditingId(null)}>
          <section className="pin-editor" onClick={(event) => event.stopPropagation()}>
            <div className="pin-editor-heading">
              <div>
                <p>{editingItem.type === "note" ? "EDIT NOTE" : "EDIT MEMORY"}</p>
                <h3>{editingItem.type === "note" ? "rewrite the paper" : "change the caption"}</h3>
              </div>
              <button type="button" onClick={() => setEditingId(null)} aria-label="Close editor">×</button>
            </div>

            <textarea
              value={editingText}
              onChange={(event) => setEditingText(event.target.value.slice(0, editingItem.type === "note" ? 220 : 90))}
              autoFocus
            />

            <div className="pin-editor-position">
              <span>fine tune position</span>
              <div>
                <button type="button" onClick={() => nudgeItem(editingItem.id, -3, 0)}>←</button>
                <button type="button" onClick={() => nudgeItem(editingItem.id, 0, -3)}>↑</button>
                <button type="button" onClick={() => nudgeItem(editingItem.id, 0, 3)}>↓</button>
                <button type="button" onClick={() => nudgeItem(editingItem.id, 3, 0)}>→</button>
                <button type="button" onClick={() => rotateItem(editingItem.id)}>↻ rotate</button>
              </div>
            </div>

            <div className="pin-editor-actions">
              <button type="button" className="danger-quiet" onClick={() => removeItem(editingItem.id)}>REMOVE</button>
              <button type="button" onClick={() => setEditingId(null)}>CANCEL</button>
              <button type="button" className="save-pin-button" onClick={saveEdit}>SAVE CHANGES</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

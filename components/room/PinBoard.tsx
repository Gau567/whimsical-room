"use client";

import { PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { MediaFormat, Track } from "@/lib/types";

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
  font?: "type" | "hand";
  linkedTrackId?: string;
};

const STORAGE_KEY = "nostalgia-pinboard-items";
const ALL_TRACKS = [...cassettes, ...cds, ...vinyls];

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
    linkedTrackId: "v2",
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
    linkedTrackId: "c1",
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

function getTrack(id?: string): Track | null {
  if (!id) return null;
  return ALL_TRACKS.find((track) => track.id === id) ?? null;
}

export default function PinBoard({
  onOpenTypewriter,
  onPlayMemory,
}: {
  onOpenTypewriter: () => void;
  onPlayMemory: (track: Track) => void;
}) {
  const [items, setItems] = useState<PinItem[]>([]);
  const [newNote, setNewNote] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingTrackId, setEditingTrackId] = useState("");
  const [formatFilter, setFormatFilter] = useState<MediaFormat | "all">("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    id: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
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
    if (viewingId === id) setViewingId(null);
  }

  function beginEdit(item: PinItem) {
    setEditingId(item.id);
    setEditingText(item.type === "note" ? item.text || "" : item.caption || "");
    setEditingTrackId(item.linkedTrackId || "");
    const track = getTrack(item.linkedTrackId);
    setFormatFilter(track?.format ?? "all");
  }

  function saveEdit() {
    if (!editingId) return;
    const value = editingText.trim();
    if (!value) return;
    save(
      items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...(item.type === "note" ? { text: value } : { caption: value }),
              linkedTrackId: editingTrackId || undefined,
            }
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
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const rect = board.getBoundingClientRect();
    const pixelDx = event.clientX - drag.startClientX;
    const pixelDy = event.clientY - drag.startClientY;
    if (Math.abs(pixelDx) + Math.abs(pixelDy) > 5) drag.moved = true;
    const dx = (pixelDx / rect.width) * 100;
    const dy = (pixelDy / rect.height) * 100;
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
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (!drag.moved) setViewingId(drag.id);
  }

  function resetBoard() {
    if (!window.confirm("Reset the board to its starter notes and photos?")) return;
    save(STARTER_ITEMS);
  }

  const noteCount = useMemo(() => items.filter((item) => item.type === "note").length, [items]);
  const editingItem = items.find((item) => item.id === editingId) ?? null;
  const viewingItem = items.find((item) => item.id === viewingId) ?? null;
  const viewingTrack = getTrack(viewingItem?.linkedTrackId);
  const visibleTracks = formatFilter === "all" ? ALL_TRACKS : ALL_TRACKS.filter((track) => track.format === formatFilter);

  return (
    <div className="pinboard-workspace pinboard-workspace-v8 pinboard-workspace-v10">
      <div className="pinboard-toolbar">
        <div>
          <p>ROOM PIN BOARD</p>
          <h2>memories can have soundtracks now</h2>
          <small>click a memory to inspect · drag to move · edit to attach a song</small>
        </div>
        <div className="pinboard-toolbar-actions">
          <button type="button" onClick={onOpenTypewriter}>⌨ TYPE A NOTE</button>
          <button type="button" className="board-reset-button" onClick={resetBoard}>RESET BOARD</button>
        </div>
      </div>

      <div className="cork-board cork-board-v8" ref={boardRef}>
        <div className="board-string string-one" />
        <div className="board-string string-two" />
        {items.map((item) => {
          const linkedTrack = getTrack(item.linkedTrackId);
          return (
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
                <div className={`sticky-note ${item.font === "hand" ? "sticky-font-hand" : "sticky-font-type"}`} style={{ background: item.color || "#f0dd9e" }}>
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

              {linkedTrack && (
                <div className={`pin-song-tag pin-song-${linkedTrack.format}`}>
                  <span>♫</span>
                  <strong>{linkedTrack.title}</strong>
                </div>
              )}

              <div className="pin-item-actions" aria-label="Pin controls">
                <button type="button" onClick={() => setViewingId(item.id)}>view</button>
                <button type="button" onClick={() => beginEdit(item)}>edit</button>
                <button type="button" onClick={() => rotateItem(item.id)} aria-label="Rotate item">↻</button>
                <button type="button" className="pin-remove" onClick={() => removeItem(item.id)} aria-label="Remove pinned item">×</button>
              </div>
            </article>
          );
        })}
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
        <small>{noteCount} note{noteCount === 1 ? "" : "s"} · positions + songs saved locally</small>
      </div>

      {viewingItem && (
        <div className="memory-viewer-backdrop" onClick={() => setViewingId(null)}>
          <section className="memory-viewer" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="memory-viewer-close" onClick={() => setViewingId(null)} aria-label="Close memory">×</button>
            <p className="memory-viewer-kicker">PINNED MEMORY</p>

            <div className={`memory-viewer-paper memory-viewer-${viewingItem.type}`}>
              {viewingItem.type === "photo" ? (
                <>
                  {viewingItem.image ? (
                    <img src={viewingItem.image} alt={viewingItem.caption || "Memory"} />
                  ) : (
                    <span className="memory-viewer-placeholder" style={{ background: viewingItem.color }} />
                  )}
                  <h3>{viewingItem.caption || "untitled memory"}</h3>
                </>
              ) : (
                <p className={viewingItem.font === "hand" ? "memory-note-hand" : "memory-note-type"}>{viewingItem.text}</p>
              )}
            </div>

            {viewingTrack ? (
              <div className="memory-soundtrack-card">
                <span>this memory sounds like</span>
                <div>
                  <i>♫</i>
                  <div>
                    <strong>{viewingTrack.title}</strong>
                    <small>{viewingTrack.artist}</small>
                  </div>
                  <em>{viewingTrack.format}</em>
                </div>
                <button type="button" onClick={() => onPlayMemory(viewingTrack)}>▶ PLAY THIS MEMORY</button>
              </div>
            ) : (
              <div className="memory-no-soundtrack">
                <span>no soundtrack attached yet</span>
                <button type="button" onClick={() => { beginEdit(viewingItem); setViewingId(null); }}>+ ATTACH A SONG</button>
              </div>
            )}

            <button type="button" className="memory-edit-link" onClick={() => { beginEdit(viewingItem); setViewingId(null); }}>
              edit memory
            </button>
          </section>
        </div>
      )}

      {editingItem && (
        <div className="pin-editor-backdrop" onClick={() => setEditingId(null)}>
          <section className="pin-editor pin-editor-v10" onClick={(event) => event.stopPropagation()}>
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

            <div className="song-link-editor">
              <div className="song-link-heading">
                <div>
                  <span>MEMORY SOUNDTRACK</span>
                  <strong>attach a song</strong>
                </div>
                {editingTrackId && <button type="button" onClick={() => setEditingTrackId("")}>REMOVE SONG</button>}
              </div>

              <div className="song-format-tabs">
                {(["all", "cassette", "cd", "vinyl"] as const).map((format) => (
                  <button
                    key={format}
                    type="button"
                    className={formatFilter === format ? "active" : ""}
                    onClick={() => setFormatFilter(format)}
                  >
                    {format === "all" ? "ALL" : format.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="song-choice-grid">
                {visibleTracks.map((track) => (
                  <button
                    type="button"
                    key={track.id}
                    className={`song-choice ${editingTrackId === track.id ? "selected" : ""}`}
                    onClick={() => setEditingTrackId(track.id)}
                  >
                    <span className="song-choice-icon" style={{ borderColor: track.color }}>{track.format === "cassette" ? "▣" : track.format === "cd" ? "◉" : "●"}</span>
                    <span>
                      <strong>{track.title}</strong>
                      <small>{track.artist}</small>
                    </span>
                    <em>{track.format}</em>
                  </button>
                ))}
              </div>
            </div>

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
              <button type="button" className="save-pin-button" onClick={saveEdit}>SAVE MEMORY</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

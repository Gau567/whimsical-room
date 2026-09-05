"use client";

import { useEffect, useMemo, useState } from "react";

type PinItem = {
  id: string;
  type: "note" | "photo";
  text?: string;
  caption?: string;
  color?: string;
  image?: string;
  createdAt: number;
};

const STORAGE_KEY = "nostalgia-pinboard-items";

const STARTER_ITEMS: PinItem[] = [
  {
    id: "starter-photo-1",
    type: "photo",
    caption: "somewhere worth going back to",
    color: "linear-gradient(145deg,#6b73ad,#d56d9c 55%,#f1a16f)",
    createdAt: 1,
  },
  {
    id: "starter-note-1",
    type: "note",
    text: "remember to make a playlist for rainy evenings",
    color: "#efd995",
    createdAt: 2,
  },
  {
    id: "starter-photo-2",
    type: "photo",
    caption: "late afternoon",
    color: "linear-gradient(145deg,#497688,#e6a26e 70%)",
    createdAt: 3,
  },
];

function loadItems(): PinItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER_ITEMS;
    return JSON.parse(raw) as PinItem[];
  } catch {
    return STARTER_ITEMS;
  }
}

export default function PinBoard({ onOpenTypewriter }: { onOpenTypewriter: () => void }) {
  const [items, setItems] = useState<PinItem[]>([]);
  const [newNote, setNewNote] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");

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
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addQuickNote() {
    const text = newNote.trim();
    if (!text) return;
    save([
      ...items,
      {
        id: `quick-note-${Date.now()}`,
        type: "note",
        text,
        color: ["#f2df9f", "#e8c8b4", "#c9d8cf", "#d4c8e8"][items.length % 4],
        createdAt: Date.now(),
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
    save([
      ...items,
      {
        id: `photo-${Date.now()}`,
        type: "photo",
        caption,
        color: gradients[items.length % gradients.length],
        createdAt: Date.now(),
      },
    ]);
    setPhotoCaption("");
  }

  function uploadPhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 1_500_000) {
      window.alert("Pick an image under 1.5 MB so the little retro board can save it locally.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "";
      if (!image) return;
      save([
        ...items,
        {
          id: `upload-${Date.now()}`,
          type: "photo",
          caption: photoCaption.trim() || file.name.replace(/\.[^.]+$/, ""),
          image,
          createdAt: Date.now(),
        },
      ]);
      setPhotoCaption("");
    };
    reader.readAsDataURL(file);
  }

  function removeItem(id: string) {
    save(items.filter((item) => item.id !== id));
  }

  const noteCount = useMemo(() => items.filter((item) => item.type === "note").length, [items]);

  return (
    <div className="pinboard-workspace">
      <div className="pinboard-toolbar">
        <div>
          <p>ROOM PIN BOARD</p>
          <h2>things worth sticking around</h2>
        </div>
        <button type="button" onClick={onOpenTypewriter}>⌨ TYPE A NOTE</button>
      </div>

      <div className="cork-board">
        <div className="board-string string-one" />
        <div className="board-string string-two" />
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`pinned-item pinned-${item.type} pin-pos-${index % 8}`}
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
            <button type="button" className="pin-remove" onClick={() => removeItem(item.id)} aria-label="Remove pinned item">×</button>
          </article>
        ))}
      </div>

      <div className="pinboard-add-bar">
        <div className="pinboard-add-note">
          <label htmlFor="quick-note">quick sticky note</label>
          <input
            id="quick-note"
            value={newNote}
            onChange={(event) => setNewNote(event.target.value.slice(0, 100))}
            placeholder="don't forget..."
          />
          <button type="button" onClick={addQuickNote}>PIN NOTE</button>
        </div>

        <div className="pinboard-add-photo">
          <label htmlFor="photo-caption">add a little photo card</label>
          <input
            id="photo-caption"
            value={photoCaption}
            onChange={(event) => setPhotoCaption(event.target.value.slice(0, 60))}
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
        <small>{noteCount} note{noteCount === 1 ? "" : "s"} pinned · saved in this browser</small>
      </div>
    </div>
  );
}

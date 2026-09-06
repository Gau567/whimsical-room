"use client";

export type RetroMediaFile = {
  name: string;
  type: "text" | "image" | "audio" | "game" | "folder";
  content: string;
};

export type RetroMediaDisk = {
  id: string;
  label: string;
  icon: string;
  kind: "floppy" | "cdrom" | "cartridge";
  description: string;
  files: RetroMediaFile[];
};

export const RETRO_MEDIA: RetroMediaDisk[] = [
  {
    id: "important-floppy",
    label: "IMPORTANT",
    icon: "💾",
    kind: "floppy",
    description: "A blue 3½-inch floppy marked IMPORTANT in fading pen.",
    files: [
      { name: "READ_ME.TXT", type: "text", content: "If you found this, congratulations. I have no memory of why I called this disk IMPORTANT.\n\nThings apparently worth remembering:\n- buy blank tapes\n- return library book\n- save the good photos\n- do not trust unlabeled cables" },
      { name: "PASSWORDS.TXT", type: "text", content: "nice try.\n\nHint: none of these passwords would pass a modern security audit." },
      { name: "SECRET.TXT", type: "text", content: "The best part of old computers is that every forgotten file feels like archaeology." },
    ],
  },
  {
    id: "summer98-floppy",
    label: "SUMMER_98",
    icon: "💾",
    kind: "floppy",
    description: "A transparent purple floppy with SUMMER 98 written on the label.",
    files: [
      { name: "DIARY.TXT", type: "text", content: "JULY 18\nIt rained all afternoon, so we stayed inside making a mixtape from songs recorded off the radio. Half the tracks start with the DJ talking. Somehow that makes them better." },
      { name: "PLACES.TXT", type: "text", content: "places to go before summer ends:\n1. the arcade with the broken racing cabinet\n2. rooftop after sunset\n3. record shop on the corner\n4. anywhere with cold soda and no schedule" },
      { name: "PHOTO_01.JPG", type: "image", content: "A badly exposed sunset photo. The date stamp says 08/14/98." },
    ],
  },
  {
    id: "room-archive-cd",
    label: "ROOM_ARCHIVE",
    icon: "💿",
    kind: "cdrom",
    description: "A scratched CD-R titled ROOM ARCHIVE / DO NOT ERASE.",
    files: [
      { name: "ABOUT.HTML", type: "text", content: "NOSTALGIA ROOM ARCHIVE\n\nThis disc is a tiny backup of things that seemed unimportant at the time: notes, half-finished playlists, ridiculous screenshots, and ordinary afternoons." },
      { name: "MIX_01.M3U", type: "audio", content: "01. rainy window\n02. bus ride home\n03. accidentally staying up too late\n04. one more song" },
      { name: "TODO_2004.TXT", type: "text", content: "[x] reorganise CDs\n[ ] beat impossible level\n[ ] reply to email\n[x] buy snacks\n[ ] become mysterious" },
    ],
  },
  {
    id: "pixelquest-cart",
    label: "PIXEL QUEST",
    icon: "🎮",
    kind: "cartridge",
    description: "A dusty cartridge with a hand-drawn spaceship on the sticker.",
    files: [
      { name: "PIXELQST.EXE", type: "game", content: "The cartridge contains a tiny lost space game. Inserted successfully — launch STARFIELD.EXE from Games for the spiritual sequel." },
      { name: "MANUAL.TXT", type: "text", content: "PIXEL QUEST\nMove. Dodge. Collect stars. Do not ask why the final boss is a toaster." },
    ],
  },
];

const STORAGE_KEY = "nostalgia-inserted-media-v1";

export function insertRetroMedia(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent("nostalgia-media-inserted", { detail: id }));
}

export function readInsertedMedia(): RetroMediaDisk | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(STORAGE_KEY);
  return RETRO_MEDIA.find((disk) => disk.id === id) || null;
}

export function ejectRetroMedia() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("nostalgia-media-inserted", { detail: null }));
}

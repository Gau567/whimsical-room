"use client";

export type RetroMediaFileType = "text" | "image" | "playlist" | "game" | "log" | "data" | "folder";

export type RetroMediaFile = {
  name: string;
  type: RetroMediaFileType;
  content: string;
  visual?: "sunset" | "arcade" | "desk" | "stars";
  trackIds?: string[];
  executable?: "starmaze";
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
      {
        name: "READ_ME.TXT",
        type: "text",
        content:
          "If you found this, congratulations. I have no memory of why I called this disk IMPORTANT.\n\nThings apparently worth remembering:\n- buy blank tapes\n- return library book\n- save the good photos\n- do not trust unlabeled cables\n\nPS: there is definitely nothing suspicious in SECRET.DAT.",
      },
      {
        name: "BOOT.LOG",
        type: "log",
        content:
          "[08:41:02] NOSTALGIA OS booted\n[08:41:03] CRT phosphor check ........ OK\n[08:41:03] floppy controller ........ OK\n[08:41:04] modem noise .............. unnecessary\n[08:41:04] memory archive ........... 87% sentimental\n[08:41:05] room link ................ ONLINE",
      },
      {
        name: "PASSWORDS.TXT",
        type: "text",
        content:
          "nice try.\n\nHint: none of these passwords would pass a modern security audit.\n\nROOM_PC: ********\nBBS_LOGIN: forgot_again\nARCADE: left-right-left-A-start\n\nPlease stop storing passwords in plaintext in 1998.",
      },
      {
        name: "SECRET.DAT",
        type: "data",
        content:
          "HEX DUMP // 4E 4F 53 54 41 4C 47 49 41\n\nDecoded fragment:\n'The best part of old computers is that every forgotten file feels like archaeology.'\n\nSECOND FRAGMENT:\n'If the cartridge is nearby, try inserting it.'",
      },
    ],
  },
  {
    id: "summer98-floppy",
    label: "SUMMER_98",
    icon: "💾",
    kind: "floppy",
    description: "A transparent purple floppy with SUMMER 98 written on the label.",
    files: [
      {
        name: "DIARY.TXT",
        type: "text",
        content:
          "JULY 18\n\nIt rained all afternoon, so we stayed inside making a mixtape from songs recorded off the radio. Half the tracks start with the DJ talking. Somehow that makes them better.\n\nThe window was open just enough to hear cars on the wet road. We kept rewinding one part because someone laughed in the background and decided that had to stay too.",
      },
      {
        name: "PLACES.TXT",
        type: "text",
        content:
          "places to go before summer ends:\n\n1. the arcade with the broken racing cabinet\n2. rooftop after sunset\n3. record shop on the corner\n4. anywhere with cold soda and no schedule\n5. bus to the last stop just to see where it ends",
      },
      {
        name: "PHOTO_01.JPG",
        type: "image",
        visual: "sunset",
        content: "A badly exposed sunset photo. The date stamp says 08/14/98.",
      },
      {
        name: "PHOTO_02.BMP",
        type: "image",
        visual: "arcade",
        content: "A blurry arcade photo with one cabinet glowing much brighter than everything else.",
      },
    ],
  },
  {
    id: "room-archive-cd",
    label: "ROOM_ARCHIVE",
    icon: "💿",
    kind: "cdrom",
    description: "A scratched CD-R titled ROOM ARCHIVE / DO NOT ERASE.",
    files: [
      {
        name: "ABOUT.HTML",
        type: "text",
        content:
          "NOSTALGIA ROOM ARCHIVE\n\nThis disc is a tiny backup of things that seemed unimportant at the time: notes, half-finished playlists, ridiculous screenshots, and ordinary afternoons.\n\nArchive rule: boring things become precious if you wait long enough.",
      },
      {
        name: "MIX_01.M3U",
        type: "playlist",
        trackIds: ["v2", "v1", "v3", "d3"],
        content: "SUMMER WINDOW MIX\nA deliberately overdramatic four-track playlist.",
      },
      {
        name: "DESKTOP.BMP",
        type: "image",
        visual: "desk",
        content: "A tiny screenshot of the room computer desktop before someone reorganised every icon.",
      },
      {
        name: "TODO_2004.TXT",
        type: "text",
        content:
          "[x] reorganise CDs\n[ ] beat impossible level\n[ ] reply to email\n[x] buy snacks\n[ ] become mysterious\n[x] make a playlist called FINAL_FINAL_v2\n[ ] stop making playlists called FINAL_FINAL_v2",
      },
    ],
  },
  {
    id: "pixelquest-cart",
    label: "PIXEL QUEST",
    icon: "🎮",
    kind: "cartridge",
    description: "A dusty cartridge with a hand-drawn spaceship on the sticker.",
    files: [
      {
        name: "PIXELQST.EXE",
        type: "game",
        executable: "starmaze",
        content:
          "PIXEL QUEST cartridge detected.\n\nExecutable signature valid.\nHidden module STARMAZE.EXE unlocked in GAMES.",
      },
      {
        name: "MANUAL.TXT",
        type: "text",
        content:
          "PIXEL QUEST\n\nMove through the star maze, collect three stars, then reach the exit.\n\nARROW KEYS: move\nR: restart\n\nDo not ask why the final boss in the original game was a toaster. The developer has not recovered emotionally.",
      },
      {
        name: "STARFIELD.BMP",
        type: "image",
        visual: "stars",
        content: "A tiny promotional bitmap showing the impossible-to-render majesty of sixteen stars.",
      },
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

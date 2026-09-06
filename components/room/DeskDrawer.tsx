"use client";

import { addPinboardItem, PinItemType } from "@/lib/pinboard";
import { insertRetroMedia, RetroMediaDisk, RETRO_MEDIA } from "@/lib/retroMedia";

type DrawerItem = {
  icon: string;
  label: string;
  pinType?: PinItemType;
  pinText?: string;
  color?: string;
  mediaId?: string;
};

const drawerData: { title: string; subtitle: string; items: DrawerItem[] }[] = [
  {
    title: "top drawer",
    subtitle: "little things that should have been thrown away",
    items: [
      { icon: "🎟️", label: "old cinema stub", pinType: "ticket", pinText: "ADMIT ONE · midnight screening", color: "#d9ba83" },
      { icon: "⭐", label: "half-used sticker sheet", pinType: "keepsake", pinText: "one good star left", color: "#d8c3df" },
      { icon: "🪙", label: "mystery coin" },
      { icon: "📝", label: "tiny to-do note", pinType: "note", pinText: "buy film · make playlist · call back", color: "#efd995" },
      { icon: "📎", label: "three paper clips" },
      { icon: "🍬", label: "one suspicious mint" },
    ],
  },
  {
    title: "middle drawer",
    subtitle: "paper memories",
    items: [
      { icon: "💌", label: "letter marked 'open later'", pinType: "letter", pinText: "OPEN LATER\n\nSome things make more sense after a little time.", color: "#ead9c4" },
      { icon: "📸", label: "two spare polaroids", pinType: "photo", pinText: "spare polaroid", color: "linear-gradient(145deg,#7886af,#d77b9f 60%,#efac79)" },
      { icon: "🌸", label: "pressed flower", pinType: "keepsake", pinText: "pressed flower from a very ordinary, very good day", color: "#ead7d6" },
      { icon: "🧾", label: "receipt from a good day", pinType: "ticket", pinText: "THANK YOU\ncoffee × 2\nlate afternoon × 1\ngood day × priceless", color: "#e9e1cc" },
      { icon: "✉️", label: "postcard never sent", pinType: "letter", pinText: "wish you were here — but also kind of glad this stayed mine.", color: "#d9d1b9" },
      { icon: "🎫", label: "concert ticket", pinType: "ticket", pinText: "LIVE TONIGHT · FLOOR B · 08:30 PM", color: "#cf9f83" },
    ],
  },
  {
    title: "bottom drawer",
    subtitle: "technology graveyard — some of it still boots",
    items: [
      { icon: "🎮", label: "old game cartridge", mediaId: "pixelquest-cart" },
      { icon: "🔌", label: "cable for something unknown" },
      { icon: "🎧", label: "wired earphones" },
      { icon: "💾", label: "floppy disk: IMPORTANT", mediaId: "important-floppy", pinType: "keepsake", pinText: "IMPORTANT.BAK\nprobably not important anymore", color: "#b8c3d6" },
      { icon: "💾", label: "purple floppy: SUMMER_98", mediaId: "summer98-floppy" },
      { icon: "💿", label: "CD-R: ROOM_ARCHIVE", mediaId: "room-archive-cd" },
      { icon: "📼", label: "blank mixtape", pinType: "keepsake", pinText: "BLANK MIXTAPE\nside A: ________\nside B: ________", color: "#be8b8f" },
      { icon: "🔋", label: "two questionable batteries" },
    ],
  },
];

function mediaById(id?: string): RetroMediaDisk | undefined {
  return RETRO_MEDIA.find((disk) => disk.id === id);
}

export default function DeskDrawer({
  drawer,
  onClose,
  onOpenBoard,
  onOpenComputer,
}: {
  drawer: number;
  onClose: () => void;
  onOpenBoard: () => void;
  onOpenComputer: () => void;
}) {
  const data = drawerData[Math.max(0, Math.min(drawer, drawerData.length - 1))];

  function pinItem(item: DrawerItem) {
    if (!item.pinType) return;
    if (item.pinType === "photo") {
      addPinboardItem({
        type: "photo",
        caption: item.pinText || item.label,
        color: item.color,
        icon: item.icon,
        source: "drawer",
      });
    } else {
      addPinboardItem({
        type: item.pinType,
        text: item.pinText || item.label,
        color: item.color,
        icon: item.icon,
        source: "drawer",
        font: item.pinType === "letter" ? "hand" : "type",
      });
    }
    onClose();
    onOpenBoard();
  }

  function plugIntoComputer(item: DrawerItem) {
    if (!item.mediaId) return;
    insertRetroMedia(item.mediaId);
    onClose();
    onOpenComputer();
  }

  return (
    <section className="drawer-modal" aria-label={data.title}>
      <div className="drawer-modal-bar">
        <span>{data.title.toUpperCase()}</span>
        <button type="button" onClick={onClose} aria-label="Close drawer">×</button>
      </div>
      <div className="drawer-modal-inner">
        <div className="drawer-liner" />
        <div className="drawer-copy">
          <h2>{data.title}</h2>
          <p>{data.subtitle}</p>
          <small>paper items can be pinned · disks can be inserted into the computer</small>
        </div>
        <div className="drawer-items drawer-items-v13">
          {data.items.map((item) => {
            const media = mediaById(item.mediaId);
            return (
              <article key={item.label} className={`drawer-item ${item.pinType ? "drawer-item-pinnable" : ""} ${item.mediaId ? "drawer-item-media" : ""}`} title={item.label}>
                <span>{item.icon}</span>
                <small>{item.label}</small>
                {media && <em>{media.files.length} files · {media.kind}</em>}
                <div className="drawer-item-actions">
                  {item.mediaId && (
                    <button type="button" onClick={() => plugIntoComputer(item)}>⌁ INSERT INTO PC</button>
                  )}
                  {item.pinType && (
                    <button type="button" onClick={() => pinItem(item)}>📌 PIN TO BOARD</button>
                  )}
                  {!item.pinType && !item.mediaId && <em>just drawer junk</em>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

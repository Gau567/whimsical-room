"use client";

import { addPinboardItem, PinItemType } from "@/lib/pinboard";

type DrawerItem = {
  icon: string;
  label: string;
  pinType?: PinItemType;
  pinText?: string;
  color?: string;
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
    subtitle: "technology graveyard",
    items: [
      { icon: "🎮", label: "old game cartridge" },
      { icon: "🔌", label: "cable for something unknown" },
      { icon: "🎧", label: "wired earphones" },
      { icon: "💾", label: "floppy disk: IMPORTANT", pinType: "keepsake", pinText: "IMPORTANT.BAK\nprobably not important anymore", color: "#b8c3d6" },
      { icon: "🔋", label: "two questionable batteries" },
      { icon: "📼", label: "blank mixtape", pinType: "keepsake", pinText: "BLANK MIXTAPE\nside A: ________\nside B: ________", color: "#be8b8f" },
    ],
  },
];

export default function DeskDrawer({
  drawer,
  onClose,
  onOpenBoard,
}: {
  drawer: number;
  onClose: () => void;
  onOpenBoard: () => void;
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
          <small>paper items can now be pinned to the room board</small>
        </div>
        <div className="drawer-items">
          {data.items.map((item) => (
            <article key={item.label} className={`drawer-item ${item.pinType ? "drawer-item-pinnable" : ""}`} title={item.label}>
              <span>{item.icon}</span>
              <small>{item.label}</small>
              {item.pinType ? (
                <button type="button" onClick={() => pinItem(item)}>📌 PIN TO BOARD</button>
              ) : (
                <em>just drawer junk</em>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

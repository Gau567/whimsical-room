"use client";

import { useState } from "react";
import { addPinboardItem, PinItemType } from "@/lib/pinboard";
import { insertRetroMedia, RetroMediaDisk, RETRO_MEDIA } from "@/lib/retroMedia";

type DrawerItem = {
  icon: string;
  label: string;
  detail: string;
  pinType?: PinItemType;
  pinText?: string;
  color?: string;
  mediaId?: string;
  easterEgg?: string;
};

const drawerData: { title: string; subtitle: string; items: DrawerItem[] }[] = [
  {
    title: "top drawer",
    subtitle: "little things that should have been thrown away",
    items: [
      { icon: "🎟️", label: "old cinema stub", detail: "PALACE CINEMA · SCREEN 4 · 11:35 PM\nSeat G12. The title has faded, but someone wrote ‘we laughed at the wrong part’ on the back.", pinType: "ticket", pinText: "PALACE CINEMA · SCREEN 4 · 11:35 PM\nSeat G12 · we laughed at the wrong part", color: "#d9ba83" },
      { icon: "⭐", label: "half-used sticker sheet", detail: "Five stars are missing. One crooked silver star remains, plus a smiley face nobody wanted enough to use.", pinType: "keepsake", pinText: "one good star left", color: "#d8c3df" },
      { icon: "🪙", label: "mystery coin", detail: "A scratched arcade token. One side says INSERT COIN. The other says COME BACK SOON.", easterEgg: "Turn it over three times and, scientifically speaking, absolutely nothing happens. Still feels lucky though." },
      { icon: "📝", label: "tiny to-do note", detail: "Written in three different pens, which suggests this list survived several bags and at least one minor crisis.", pinType: "note", pinText: "buy film · make playlist · call back · water plant · remember charger", color: "#efd995" },
      { icon: "📎", label: "three paper clips", detail: "Two normal paper clips. One bent into a shape that is either a heart or evidence of boredom." },
      { icon: "🍬", label: "one suspicious mint", detail: "Still wrapped. Best-before date unreadable. Smells aggressively peppermint-adjacent.", easterEgg: "FORTUNE: today has strong ‘find five dollars in an old pocket’ energy." },
    ],
  },
  {
    title: "middle drawer",
    subtitle: "paper memories",
    items: [
      { icon: "💌", label: "letter marked 'open later'", detail: "The envelope has been opened and resealed twice. Inside is one page, folded into quarters.", pinType: "letter", pinText: "OPEN LATER\n\nIf you are reading this, I hope the thing that felt enormous got smaller. I hope you kept making things just because they made you curious. I hope you still know at least one song by heart.\n\nAnd if none of that happened yet, later can mean later again.", color: "#ead9c4" },
      { icon: "📸", label: "two spare polaroids", detail: "Blank instant-film frames. Someone drew tiny stars on the white borders before the photos were even taken.", pinType: "photo", pinText: "spare polaroid · write the date underneath", color: "linear-gradient(145deg,#7886af,#d77b9f 60%,#efac79)" },
      { icon: "🌸", label: "pressed flower", detail: "Pressed between two pieces of tracing paper. No label, no date, just a tiny pink petal that somehow survived.", pinType: "keepsake", pinText: "pressed flower from a very ordinary, very good day", color: "#ead7d6" },
      { icon: "🧾", label: "receipt from a good day", detail: "CAFÉ CORNER · 4:16 PM\n2 iced drinks · 1 cake slice · 1 extra fork\nThe total is smudged. The memory is not.", pinType: "ticket", pinText: "CAFÉ CORNER · 4:16 PM\niced drinks × 2\ncake slice × 1\nextra fork × 1\nGOOD DAY × priceless", color: "#e9e1cc" },
      { icon: "✉️", label: "postcard never sent", detail: "Front: a washed-out seaside photo. Back: three lines, then a blank address box.", pinType: "letter", pinText: "wish you were here.\nActually, I think I needed one place that was only mine for a little while.\nI’ll tell you about it when I get back.", color: "#d9d1b9" },
      { icon: "🎫", label: "concert ticket", detail: "LIVE TONIGHT · FLOOR B · 08:30 PM\nThere is a tiny crease down the centre from being kept in a phone case all night.", pinType: "ticket", pinText: "LIVE TONIGHT · FLOOR B · 08:30 PM\nDOORS 7:00 · KEEP THIS STUB", color: "#cf9f83" },
    ],
  },
  {
    title: "bottom drawer",
    subtitle: "technology graveyard — some of it still boots",
    items: [
      { icon: "🎮", label: "old game cartridge", detail: "PIXEL QUEST. The sticker is peeling at one corner and someone has drawn an extra spaceship in pen.", mediaId: "pixelquest-cart" },
      { icon: "🔌", label: "cable for something unknown", detail: "One end is familiar. The other end appears to have been designed by a civilisation that no longer exists.", easterEgg: "A label hidden under the twist-tie says: DO NOT THROW AWAY. Naturally, nobody knows what it belongs to." },
      { icon: "🎧", label: "wired earphones", detail: "Left ear works if the cable is held at a precise 34-degree angle. Right ear is emotionally supportive." },
      { icon: "💾", label: "floppy disk: IMPORTANT", detail: "Blue 3½-inch floppy. ‘IMPORTANT’ is written in fading black marker, underlined twice.", mediaId: "important-floppy", pinType: "keepsake", pinText: "IMPORTANT.BAK\nprobably not important anymore", color: "#b8c3d6" },
      { icon: "💾", label: "purple floppy: SUMMER_98", detail: "Transparent purple plastic. The handwritten label has a tiny sun doodle beside SUMMER_98.", mediaId: "summer98-floppy" },
      { icon: "💿", label: "CD-R: ROOM_ARCHIVE", detail: "Silver CD-R with ROOM_ARCHIVE written around the centre ring. A second line says DO NOT FINALIZE AGAIN.", mediaId: "room-archive-cd" },
      { icon: "📼", label: "blank mixtape", detail: "Still has both little write-protect tabs. The label card is completely blank and therefore full of unreasonable potential.", pinType: "keepsake", pinText: "BLANK MIXTAPE\nside A: ________\nside B: ________", color: "#be8b8f" },
      { icon: "🔋", label: "two questionable batteries", detail: "One says 36%. The other says nothing. Neither statement can be trusted." },
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
  const [selected, setSelected] = useState<DrawerItem | null>(null);

  function pinItem(item: DrawerItem) {
    if (!item.pinType) return;
    if (item.pinType === "photo") {
      addPinboardItem({ type: "photo", caption: item.pinText || item.label, color: item.color, icon: item.icon, source: "drawer" });
    } else {
      addPinboardItem({ type: item.pinType, text: item.pinText || item.label, color: item.color, icon: item.icon, source: "drawer", font: item.pinType === "letter" ? "hand" : "type" });
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
          <small>look closer · pin paper things · insert old media into the computer</small>
        </div>
        <div className="drawer-items drawer-items-v23">
          {data.items.map((item) => {
            const media = mediaById(item.mediaId);
            return (
              <article key={item.label} className={`drawer-item ${item.pinType ? "drawer-item-pinnable" : ""} ${item.mediaId ? "drawer-item-media" : ""}`} title={item.label}>
                <span>{item.icon}</span>
                <small>{item.label}</small>
                {media && <em>{media.files.length} files · {media.kind}</em>}
                <div className="drawer-item-actions">
                  <button type="button" onClick={() => setSelected(item)}>◌ LOOK CLOSER</button>
                  {item.mediaId && <button type="button" onClick={() => plugIntoComputer(item)}>⌁ INSERT INTO PC</button>}
                  {item.pinType && <button type="button" onClick={() => pinItem(item)}>📌 PIN TO BOARD</button>}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="drawer-inspect-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <article className="drawer-inspect-card" role="dialog" aria-modal="true" aria-label={selected.label}>
            <button type="button" className="drawer-inspect-close" onClick={() => setSelected(null)} aria-label="Close item">×</button>
            <div className="drawer-inspect-icon">{selected.icon}</div>
            <p className="drawer-inspect-kicker">FOUND IN {data.title.toUpperCase()}</p>
            <h3>{selected.label}</h3>
            <pre>{selected.detail}</pre>
            {selected.easterEgg && <div className="drawer-easter-egg">✦ {selected.easterEgg}</div>}
            <div className="drawer-inspect-actions">
              {selected.mediaId && <button type="button" onClick={() => plugIntoComputer(selected)}>INSERT INTO PC</button>}
              {selected.pinType && <button type="button" onClick={() => pinItem(selected)}>PIN TO BOARD</button>}
              <button type="button" onClick={() => setSelected(null)}>PUT BACK</button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

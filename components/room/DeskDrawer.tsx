"use client";

const drawerData = [
  {
    title: "top drawer",
    subtitle: "little things that should have been thrown away",
    items: [
      ["🎟️", "old cinema stub"],
      ["⭐", "half-used sticker sheet"],
      ["🪙", "mystery coin"],
      ["📝", "tiny to-do note"],
      ["📎", "three paper clips"],
      ["🍬", "one suspicious mint"],
    ],
  },
  {
    title: "middle drawer",
    subtitle: "paper memories",
    items: [
      ["💌", "letter marked 'open later'"],
      ["📸", "two spare polaroids"],
      ["🌸", "pressed flower"],
      ["🧾", "receipt from a good day"],
      ["✉️", "postcard never sent"],
      ["🎫", "concert ticket"],
    ],
  },
  {
    title: "bottom drawer",
    subtitle: "technology graveyard",
    items: [
      ["🎮", "old game cartridge"],
      ["🔌", "cable for something unknown"],
      ["🎧", "wired earphones"],
      ["💾", "floppy disk: IMPORTANT"],
      ["🔋", "two questionable batteries"],
      ["📼", "blank mixtape"],
    ],
  },
];

export default function DeskDrawer({ drawer, onClose }: { drawer: number; onClose: () => void }) {
  const data = drawerData[Math.max(0, Math.min(drawer, drawerData.length - 1))];
  return (
    <section className="drawer-modal" aria-label={data.title}>
      <div className="drawer-modal-bar"><span>{data.title.toUpperCase()}</span><button type="button" onClick={onClose} aria-label="Close drawer">×</button></div>
      <div className="drawer-modal-inner">
        <div className="drawer-liner" />
        <div className="drawer-copy"><h2>{data.title}</h2><p>{data.subtitle}</p></div>
        <div className="drawer-items">
          {data.items.map(([icon, label]) => <button type="button" key={label} className="drawer-item" title={label}><span>{icon}</span><small>{label}</small></button>)}
        </div>
      </div>
    </section>
  );
}

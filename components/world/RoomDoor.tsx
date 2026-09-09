"use client";

import type { ReactNode } from "react";
import type { RoomId } from "@/lib/world/worldTypes";
import { useWorld } from "@/lib/world/WorldContext";

type RoomDoorProps = {
  room: Exclude<RoomId, "hub">;
  number: string;
  title: string;
  subtitle: string;
  lockedHint?: string;
  accent?: "rose" | "amber" | "cyan" | "blue" | "violet" | "copper" | "green";
  detail?: ReactNode;
  className?: string;
};

export default function RoomDoor({
  room,
  number,
  title,
  subtitle,
  lockedHint = "the handle will not turn",
  accent = "amber",
  detail,
  className = "",
}: RoomDoorProps) {
  const { enterRoom, isRoomUnlocked } = useWorld();
  const unlocked = isRoomUnlocked(room);

  return (
    <article
      className={`room-door-v2 room-door-v2-${accent} ${
        unlocked ? "is-unlocked" : "is-locked"
      } ${className}`}
      data-room={room}
    >
      <div className="room-door-v2-heading">
        <span>ROOM {number}</span>
        <i aria-hidden="true">{unlocked ? "OPEN" : "LOCKED"}</i>
      </div>

      <button
        type="button"
        className="room-door-v2-door"
        disabled={!unlocked}
        onClick={() => enterRoom(room)}
        aria-label={unlocked ? `Enter ${title}` : `${title} is locked`}
      >
        <span className="room-door-v2-panels" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>

        <span className="room-door-v2-numberplate">{number}</span>
        <span className="room-door-v2-handle" aria-hidden="true" />
        <span className="room-door-v2-light" aria-hidden="true" />
        <span className="room-door-v2-lock">{unlocked ? "ENTER" : "LOCKED"}</span>
      </button>

      <div className="room-door-v2-copy">
        <strong>{title}</strong>
        <small>{unlocked ? subtitle : lockedHint}</small>
      </div>

      {detail && <div className="room-door-v2-detail">{detail}</div>}
    </article>
  );
}

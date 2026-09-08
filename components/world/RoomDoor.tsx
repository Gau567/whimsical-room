"use client";

import { useWorld } from "@/lib/world/WorldContext";
import type { RoomDefinition } from "@/lib/world/worldTypes";

type RoomDoorProps = {
  room: RoomDefinition;
  className?: string;
};

export default function RoomDoor({ room, className = "" }: RoomDoorProps) {
  const { enterRoom, isRoomUnlocked } = useWorld();
  const unlocked = isRoomUnlocked(room.id);

  return (
    <button
      type="button"
      className={`world-door ${
        unlocked ? "world-door-unlocked" : "world-door-locked"
      } ${className}`.trim()}
      onClick={() => {
        if (unlocked) enterRoom(room.id);
      }}
      aria-label={
        unlocked
          ? `Enter ${room.title}`
          : `${room.title} is currently locked`
      }
      aria-disabled={!unlocked}
    >
      <span className="door-number">ROOM {room.number}</span>

      <span className="door-panel" aria-hidden="true">
        <span className="door-panel-inset" />
        <span className="door-handle" />
        {!unlocked && <span className="door-lock-plate">LOCKED</span>}
      </span>

      <span className="door-label">
        <strong>{room.title}</strong>
        <small>{unlocked ? room.subtitle : "something is keeping this door shut"}</small>
      </span>
    </button>
  );
}

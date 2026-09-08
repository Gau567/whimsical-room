"use client";

import RoomDoor from "./RoomDoor";
import { WORLD_ROOMS } from "@/lib/world/worldTypes";

export default function WorldHub() {
  const nostalgia = WORLD_ROOMS.find((room) => room.id === "nostalgia")!;
  const study = WORLD_ROOMS.find((room) => room.id === "study")!;
  const arcade = WORLD_ROOMS.find((room) => room.id === "arcade")!;
  const observatory = WORLD_ROOMS.find((room) => room.id === "observatory")!;
  const dream = WORLD_ROOMS.find((room) => room.id === "dream")!;
  const train = WORLD_ROOMS.find((room) => room.id === "train")!;
  const greenhouse = WORLD_ROOMS.find((room) => room.id === "greenhouse")!;

  return (
    <main className="world-hub">
      <div className="world-hub-grain" aria-hidden="true" />

      <header className="world-hub-title">
        <p>somewhere between</p>
        <h1>THE ROOMS</h1>
        <span>every door remembers something</span>
      </header>

      <section className="hallway" aria-label="Hallway of rooms">
        <div className="hallway-side hallway-left">
          <RoomDoor room={nostalgia} />
          <RoomDoor room={arcade} />
          <RoomDoor room={dream} />
        </div>

        <div className="hallway-center" aria-hidden="true">
          <div className="hallway-clock">
            <span>11:47</span>
          </div>

          <div className="hallway-frame hallway-frame-one">✦</div>
          <div className="hallway-frame hallway-frame-two">☾</div>

          <div className="hallway-table">
            <span className="hallway-note">
              SOME DOORS OPEN
              <br />
              FROM THE OTHER SIDE
            </span>
          </div>

          <div className="hallway-rug" />
        </div>

        <div className="hallway-side hallway-right">
          <RoomDoor room={study} />
          <RoomDoor room={observatory} />
          <RoomDoor room={train} />
        </div>

        <div className="greenhouse-door">
          <RoomDoor room={greenhouse} />
        </div>
      </section>
    </main>
  );
}

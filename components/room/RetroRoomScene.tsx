"use client";

import { MediaFormat } from "@/lib/types";

type RoomChoice = MediaFormat | "journal" | "books" | "computer" | "typewriter" | "pinboard";

export default function RetroRoomScene({
  onSelect,
  lampOn,
  onToggleLamp,
  onOpenDrawer,
}: {
  onSelect: (item: RoomChoice) => void;
  lampOn: boolean;
  onToggleLamp: () => void;
  onOpenDrawer: (drawer: number) => void;
}) {
  const shelfBooks = ["MOON", "SIDE A", "SMALL", "AFTER", "PHOTO", "NOTES", "DREAM", "PLACES"];

  return (
    <section className="retro-scene retro-scene-v6" aria-label="Interactive retro nostalgia room">
      <div className="retro-wall retro-wall-v6" aria-hidden="true">
        <div className="retro-window retro-window-v6">
          <div className="retro-sky">
            <span className="sky-cloud sky-cloud-a" />
            <span className="sky-cloud sky-cloud-b" />
          </div>
          <span className="blind blind-a" />
          <span className="blind blind-b" />
          <span className="blind blind-c" />
          <span className="window-vine vine-a" />
          <span className="window-vine vine-b" />
        </div>

        <div className="poster-cluster-v6">
          <div className="poster poster-one poster-one-v6">
            <span>A BRIGHTER</span>
            <strong>TOMORROW</strong>
            <i>✦</i>
          </div>
          <div className="poster poster-two poster-two-v6">
            <span>SAME KID</span>
            <strong>DIFFERENT UNIVERSE</strong>
            <i>◎</i>
          </div>
          <div className="poster poster-three poster-three-v6">
            <span>KEEP</span>
            <strong>GOING</strong>
            <i>★</i>
          </div>
        </div>

        <button
          type="button"
          className="room-pinboard room-pinboard-v6 hotspot"
          onClick={() => onSelect("pinboard")}
          aria-label="Open room pin board"
        >
          <span className="mini-pin mini-pin-a" />
          <span className="mini-pin mini-pin-b" />
          <span className="mini-board-note mini-note-a">don&apos;t forget ♡</span>
          <span className="mini-board-photo"><i /></span>
          <span className="mini-board-ticket">GOOD DAYS</span>
          <span className="object-tip">pin board</span>
        </button>

        <div className="neon-sign neon-sign-v6">
          <span>There&apos;s</span>
          <strong>More Out There</strong>
        </div>
      </div>

      <div className="retro-desk retro-desk-v6">
        <div className="desk-surface desk-surface-v6">
          <button
            type="button"
            className="desk-computer desk-computer-v6 hotspot"
            onClick={() => onSelect("computer")}
            aria-label="Open retro computer"
          >
            <span className="crt-shell">
              <span className="crt-screen">
                <small>nostalgia.exe</small>
                <strong>GOOD!</strong>
                <em>things ahead.</em>
                <span className="crt-smile">☺</span>
              </span>
              <span className="crt-power" />
            </span>
            <span className="object-tip">open computer</span>
          </button>

          <button
            type="button"
            className="desk-typewriter-mini desk-typewriter-mini-v6 hotspot"
            onClick={() => onSelect("typewriter")}
            aria-label="Use the typewriter"
          >
            <span className="mini-tw-paper" />
            <span className="mini-tw-carriage" />
            <span className="mini-tw-body">
              <i className="mini-tw-spool mini-tw-left" />
              <i className="mini-tw-spool mini-tw-right" />
              <b className="mini-tw-keys" />
            </span>
            <span className="object-tip">typewriter</span>
          </button>

          <div className="desk-polaroid desk-polaroid-v6" aria-hidden="true"><span /></div>
          <div className="desk-cup desk-cup-v6" aria-hidden="true">☕</div>
        </div>

        <div className="desk-drawers desk-drawers-v6" aria-label="Desk drawers">
          {[0, 1, 2].map((drawer) => (
            <button
              key={drawer}
              type="button"
              className="desk-drawer-button"
              onClick={() => onOpenDrawer(drawer)}
              aria-label={`Open ${["top", "middle", "bottom"][drawer]} drawer`}
            >
              <span className="drawer-handle-mini" />
              <span className="drawer-hover-label">open</span>
            </button>
          ))}
        </div>
      </div>

      <div className="retro-shelf retro-shelf-v7" aria-label="Media cabinet">
        <div className="shelf-top-decor" aria-hidden="true">
          <div className="shelf-top-books">
            <span>SPACE</span>
            <span>DREAMS</span>
            <span>MUSIC</span>
          </div>
          <button
            type="button"
            className={`shelf-lamp-v7 hotspot ${lampOn ? "lamp-on-v7" : ""}`}
            onClick={onToggleLamp}
            aria-label="Toggle shelf lamp"
          >
            <span className="object-tip">mood lamp</span>
          </button>
        </div>

        <div className="cabinet-row cabinet-row-player">
          <button
            type="button"
            className="room-turntable room-turntable-v7 hotspot"
            onClick={() => onSelect("vinyl")}
            aria-label="Open vinyl collection"
          >
            <span className="turntable-lid" />
            <span className="turntable-base">
              <span className="turntable-platter"><i /></span>
              <span className="turntable-arm" />
            </span>
            <span className="object-tip">vinyl collection</span>
          </button>

          <div className="record-bin-v7" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>

        <div className="cabinet-row cabinet-row-audio">
          <button
            type="button"
            className="room-cassette-deck room-cassette-deck-v7 hotspot"
            onClick={() => onSelect("cassette")}
            aria-label="Open cassette collection"
          >
            <span className="deck-display">TAPE</span>
            <span className="deck-window"><i /><b /><i /></span>
            <span className="deck-buttons">● ● ▷</span>
            <span className="object-tip">cassette collection</span>
          </button>

          <button
            type="button"
            className="room-cd-deck room-cd-deck-v7 hotspot"
            onClick={() => onSelect("cd")}
            aria-label="Open CD collection"
          >
            <span className="cd-slot" />
            <span className="cd-display">TRACK 03&nbsp;&nbsp;02:17</span>
            <span className="cd-knob" />
            <span className="object-tip">CD collection</span>
          </button>
        </div>

        <div className="cabinet-row cabinet-row-memory">
          <button
            type="button"
            className="photo-stack photo-stack-v7 hotspot"
            onClick={() => onSelect("journal")}
            aria-label="Open memories and journal"
          >
            <span className="photo-card card-a"><i /></span>
            <span className="photo-card card-b"><i /></span>
            <span className="photo-card card-c"><i /></span>
            <span className="object-tip">memories</span>
          </button>

          <button
            type="button"
            className="shelf-journal shelf-journal-v7 hotspot"
            onClick={() => onSelect("journal")}
            aria-label="Open journal"
          >
            <span>late nights</span>
            <strong>bright ideas</strong>
            <span className="object-tip">journal</span>
          </button>
        </div>

        <div className="cabinet-row cabinet-row-books">
          <button
            type="button"
            className="book-row book-row-v7 hotspot"
            onClick={() => onSelect("books")}
            aria-label="Open readable books"
          >
            {shelfBooks.map((label, i) => (
              <span key={label} className={`shelf-book-spine shelf-book-${i + 1}`}>
                <b>{label}</b>
              </span>
            ))}
            <span className="object-tip">read the books</span>
          </button>
        </div>
      </div>

      <div className="retro-floor retro-floor-v6" aria-hidden="true">
        <div className="checker-rug checker-rug-v6"><span>☺</span></div>
        <div className="floor-tapes floor-tapes-v6"><span /><span /><span /></div>
      </div>

      <p className="room-instruction room-instruction-v6">hover, click, explore</p>
    </section>
  );
}

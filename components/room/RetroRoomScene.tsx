"use client";

import { MediaFormat } from "@/lib/types";

type RoomChoice = MediaFormat | "books" | "computer";

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
  return (
    <section className="retro-scene" aria-label="Interactive retro nostalgia room">
      <div className="retro-wall" aria-hidden="true">
        <div className="retro-window">
          <div className="retro-sky">
            <span className="sky-cloud sky-cloud-a" />
            <span className="sky-cloud sky-cloud-b" />
            <span className="city city-a" />
            <span className="city city-b" />
            <span className="city city-c" />
          </div>
          <span className="blind blind-a" />
          <span className="blind blind-b" />
          <span className="blind blind-c" />
          <span className="window-vine vine-a" />
          <span className="window-vine vine-b" />
        </div>

        <div className="poster poster-one">
          <span>A BRIGHTER</span>
          <strong>TOMORROW</strong>
          <i>✦</i>
        </div>
        <div className="poster poster-two">
          <span>SAME KID</span>
          <strong>DIFFERENT UNIVERSE</strong>
          <i>◎</i>
        </div>
        <div className="poster poster-three">
          <span>KEEP</span>
          <strong>GOING</strong>
          <i>★</i>
        </div>
        <div className="tiny-print print-a">✿</div>
        <div className="tiny-print print-b">☾</div>
        <div className="tiny-print print-c">✦</div>

        <div className="neon-sign">
          <span>There&apos;s</span>
          <strong>More Out There</strong>
          <i>✦ ◯</i>
        </div>
      </div>

      <div className="retro-desk">
        <div className="desk-surface">
          <button
            type="button"
            className="desk-computer hotspot"
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

          <div className="keyboard" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>

          <button
            type="button"
            className={`lava-lamp hotspot ${lampOn ? "lava-on" : ""}`}
            onClick={onToggleLamp}
            aria-label="Toggle mood lighting"
            aria-pressed={lampOn}
          >
            <span className="lava-cap" />
            <span className="lava-glass">
              <i className="lava-blob blob-a" />
              <i className="lava-blob blob-b" />
            </span>
            <span className="lava-base" />
            <span className="object-tip">mood light</span>
          </button>

          <div className="desk-polaroid" aria-hidden="true">
            <span />
          </div>
          <div className="desk-plant" aria-hidden="true">✿</div>
          <div className="desk-cup" aria-hidden="true">☕</div>
        </div>
        <div className="desk-drawers" aria-label="Desk drawers">
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

      <div className="retro-shelf">
        <div className="shelf-crown">
          <div className="shelf-globe">◉</div>
          <div className="shelf-books-top">
            <span>space</span><span>dreams</span><span>music</span><span>places</span>
          </div>
          <div className="shelf-dino">🦕</div>
        </div>

        <div className="shelf-level shelf-turntable-level">
          <button
            type="button"
            className="room-turntable hotspot"
            onClick={() => onSelect("vinyl")}
            aria-label="Open vinyl collection"
          >
            <span className="turntable-lid" />
            <span className="turntable-base">
              <span className="turntable-platter">
                <i />
              </span>
              <span className="turntable-arm" />
            </span>
            <span className="object-tip">vinyl collection</span>
          </button>
          <div className="vinyl-stack" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="shelf-moon-lamp" aria-hidden="true" />
        </div>

        <div className="shelf-level shelf-player-level">
          <button
            type="button"
            className="room-cassette-deck hotspot"
            onClick={() => onSelect("cassette")}
            aria-label="Open cassette collection"
          >
            <span className="deck-display">TAPE</span>
            <span className="deck-window">
              <i /><b /><i />
            </span>
            <span className="deck-buttons">● ● ▷</span>
            <span className="object-tip">cassette collection</span>
          </button>

          <button
            type="button"
            className="room-cd-deck hotspot"
            onClick={() => onSelect("cd")}
            aria-label="Open CD collection"
          >
            <span className="cd-slot" />
            <span className="cd-display">TRACK 03&nbsp;&nbsp; 02:17</span>
            <span className="cd-knob" />
            <span className="object-tip">CD collection</span>
          </button>

          <div className="cassette-piles" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>

        <div className="shelf-level shelf-memory-level">
          <button
            type="button"
            className="photo-stack hotspot"
            onClick={() => onSelect("books")}
            aria-label="Open memories and journal"
          >
            <span className="photo-card card-a"><i /></span>
            <span className="photo-card card-b"><i /></span>
            <span className="photo-card card-c"><i /></span>
            <span className="object-tip">memories</span>
          </button>
          <div className="mini-tv" aria-hidden="true">
            <span className="mini-tv-screen">PRESS START ♡</span>
          </div>
          <button
            type="button"
            className="shelf-journal hotspot"
            onClick={() => onSelect("books")}
            aria-label="Open journal"
          >
            <span>late nights</span>
            <strong>bright ideas</strong>
            <span className="object-tip">journal</span>
          </button>
        </div>

        <div className="shelf-level shelf-books-level">
          <button
            type="button"
            className="book-row hotspot"
            onClick={() => onSelect("books")}
            aria-label="Open books and letters"
          >
            {Array.from({ length: 13 }).map((_, i) => (
              <span key={i} style={{ height: `${44 + ((i * 7) % 22)}px` }} />
            ))}
            <span className="object-tip">books & letters</span>
          </button>
          <div className="radio-box" aria-hidden="true">♫</div>
        </div>
      </div>

      <div className="retro-floor" aria-hidden="true">
        <div className="checker-rug"><span>☺</span></div>
        <div className="floor-crate"><i /><i /><i /><i /></div>
        <div className="floor-tapes"><span /><span /><span /></div>
        <div className="headphones">◖◗</div>
      </div>

      <p className="room-instruction">click the objects that glow when you hover</p>
    </section>
  );
}

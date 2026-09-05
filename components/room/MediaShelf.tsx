"use client";

import { MediaFormat } from "@/lib/types";

type ShelfChoice = MediaFormat | "books";

export default function MediaShelf({
  onSelect,
}: {
  onSelect: (item: ShelfChoice) => void;
}) {
  return (
    <section className="media-shelf" aria-label="Nostalgia media shelf">
      <div className="shelf-top-trim" />

      <div className="shelf-row shelf-row-devices">
        <button
          type="button"
          className="shelf-object shelf-cassette-player"
          onClick={() => onSelect("cassette")}
          aria-label="Open cassette collection"
        >
          <span className="mini-player-label">WALKMAN</span>
          <span className="mini-cassette-window">
            <span className="mini-reel" />
            <span className="mini-tape-label">TAPE</span>
            <span className="mini-reel" />
          </span>
          <span className="shelf-object-name">cassettes</span>
        </button>

        <button
          type="button"
          className="shelf-object shelf-cd-player"
          onClick={() => onSelect("cd")}
          aria-label="Open CD collection"
        >
          <span className="mini-player-label">DISCMAN</span>
          <span className="mini-cd-lid">
            <span className="mini-cd" />
          </span>
          <span className="shelf-object-name">CDs</span>
        </button>

        <button
          type="button"
          className="shelf-object shelf-vinyl-player"
          onClick={() => onSelect("vinyl")}
          aria-label="Open vinyl collection"
        >
          <span className="mini-player-label">TURNTABLE</span>
          <span className="mini-turntable">
            <span className="mini-record" />
            <span className="mini-tonearm" />
          </span>
          <span className="shelf-object-name">vinyl</span>
        </button>
      </div>

      <div className="wood-shelf-board" />

      <div className="shelf-row shelf-row-keepsakes">
        <button
          type="button"
          className="book-stack"
          onClick={() => onSelect("books")}
          aria-label="Open books"
        >
          <span className="book book-one">letters</span>
          <span className="book book-two">journal</span>
          <span className="book book-three">memories</span>
        </button>

        <div className="shelf-polaroids" aria-hidden="true">
          <span className="tiny-polaroid polaroid-a" />
          <span className="tiny-polaroid polaroid-b" />
        </div>

        <button
          type="button"
          className="shelf-trinket"
          onClick={() => onSelect("books")}
          aria-label="Look through keepsakes"
        >
          <span className="trinket-radio">♪</span>
          <span className="shelf-object-name">keepsakes</span>
        </button>

        <div className="shelf-plant" aria-hidden="true">
          <span className="plant-leaf leaf-one" />
          <span className="plant-leaf leaf-two" />
          <span className="plant-leaf leaf-three" />
          <span className="plant-pot" />
        </div>
      </div>

      <div className="wood-shelf-board" />

      <p className="shelf-hint">click something on the shelf</p>
    </section>
  );
}

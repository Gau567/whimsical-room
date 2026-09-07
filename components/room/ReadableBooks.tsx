"use client";

import { useState } from "react";

type Book = {
  id: string;
  title: string;
  subtitle: string;
  spine: string;
  accent: string;
  pages: { heading: string; body: string[] }[];
};

const BOOKS: Book[] = [
  {
    id: "arcade",
    title: "The Moonlit Arcade",
    subtitle: "a tiny story about finding one more level",
    spine: "MOONLIT ARCADE",
    accent: "#7a5a92",
    pages: [
      { heading: "1 · INSERT COIN", body: ["At 11:47 p.m., the arcade should have been closed.", "Mina only noticed the blue light because every other shop on the street had gone dark. One machine in the back still hummed, its screen waiting on a single sentence: PLAYER TWO NEEDED.", "She had exactly one coin in her pocket, and no particularly sensible reason to use it."] },
      { heading: "2 · CONTINUE?", body: ["The game had no enemies. It only asked questions.", "What song do you remember before you remember the year? Which place would you visit again if nobody could know? What did you stop doing because you thought you had outgrown it?", "Every answer opened another pixel doorway."] },
      { heading: "3 · HIGH SCORE", body: ["When Mina finally reached the last screen, there was no score at all.", "Instead, the machine printed a paper ticket: KEEP THE THINGS THAT MAKE TIME FEEL STRANGE.", "The arcade was dark the next evening. She kept the ticket anyway."] },
      { heading: "4 · PLAYER TWO", body: ["Months later, Mina found the token in a coat pocket and went back.", "The shop was still empty. The same machine was waiting. This time the screen read: PLAYER TWO FOUND.", "Someone had left another coin on the controls."] },
    ],
  },
  {
    id: "mixtape",
    title: "Side A / Side B",
    subtitle: "notes from a very unnecessary mixtape",
    spine: "SIDE A / SIDE B",
    accent: "#b06470",
    pages: [
      { heading: "SIDE A · FOR LEAVING", body: ["Track one should make the bus ride feel cinematic, even if the bus is late and the air-conditioning is suspiciously aggressive.", "Track two belongs to rainy windows. Track three is for walking somewhere without checking the map every thirty seconds.", "Do not put the best song first. Make people earn it."] },
      { heading: "SIDE B · FOR RETURNING", body: ["The second side should sound like coming home after everyone is asleep.", "There should be one song you have overplayed beyond reason and one song you forgot existed until the first three seconds bring everything back.", "Leave ten seconds of silence at the end. Some endings need room."] },
      { heading: "LABEL NOTES", body: ["Use the bad handwriting. Cross out the song you changed your mind about. Add one tiny doodle in the corner.", "A perfect label looks purchased. A good label looks like someone cared too much for twenty minutes.", "Date it. You will be glad you did."] },
    ],
  },
  {
    id: "smallthings",
    title: "Small Things Worth Keeping",
    subtitle: "an unofficial field guide",
    spine: "SMALL THINGS",
    accent: "#4e7375",
    pages: [
      { heading: "FIELD NOTE 01", body: ["Keep ticket stubs if you remember the conversation more than the event.", "Keep terrible blurry photos if they contain a perfect five seconds.", "Keep handwritten notes. Nobody has ever regretted finding old handwriting in a drawer."] },
      { heading: "FIELD NOTE 02", body: ["Delete screenshots that mean nothing. Keep the ones that make absolutely no sense without context.", "Write dates on things. Future-you is not the detective current-you thinks they are.", "And save the playlist before editing it. This advice is both emotional and technical."] },
      { heading: "FIELD NOTE 03", body: ["Not everything has to be useful to be worth keeping.", "Sometimes an object earns its space simply because touching it collapses ten years into ten seconds."] },
      { heading: "FIELD NOTE 04", body: ["The best souvenirs are often free: a receipt, a paper wristband, a note written on the back of something else.", "Objects do not remember for you. They just leave the door unlocked."] },
    ],
  },
  {
    id: "afterhours",
    title: "After Hours Manual",
    subtitle: "instructions for nights that refuse to end",
    spine: "AFTER HOURS",
    accent: "#c17f55",
    pages: [
      { heading: "RULE 01 · LIGHTING", body: ["Turn off the big light. This is non-negotiable.", "Use one lamp that makes the room look approximately 30% more dramatic than it really is.", "If a lava lamp is available, history requires that you switch it on."] },
      { heading: "RULE 02 · SOUND", body: ["Choose music before opening your work. Otherwise you will spend forty minutes choosing music and call it preparation.", "Headphones are allowed. Singing badly is encouraged when nobody is around to file a complaint."] },
      { heading: "RULE 03 · 2:17 A.M.", body: ["At 2:17 a.m. every idea becomes either brilliant or deeply questionable.", "Write it down anyway. Daylight can perform quality control later.", "If your computer makes a noise it has never made before, save first and investigate second."] },
    ],
  },
  {
    id: "polaroid",
    title: "The Polaroid Rule",
    subtitle: "a small guide to imperfect photographs",
    spine: "POLAROID RULE",
    accent: "#8b7898",
    pages: [
      { heading: "RULE 01 · WAIT", body: ["Do not shake the picture. Everyone knows this and everyone still wants to.", "Put it face-down for a minute. Let the image arrive without supervision.", "The waiting is part of the photograph."] },
      { heading: "RULE 02 · KEEP THE BAD ONE", body: ["Keep one photo where someone blinked, someone moved, or the flash hit the mirror.", "Technically imperfect photographs are often the only ones that remember how the room actually felt."] },
      { heading: "RULE 03 · WRITE ON IT", body: ["Add the date. Add the place. Add a sentence only the people in the photo would understand.", "Years later, the handwriting may matter as much as the image."] },
    ],
  },
  {
    id: "places",
    title: "Places We Almost Went",
    subtitle: "a pocket atlas of nearly-made plans",
    spine: "PLACES",
    accent: "#6f8395",
    pages: [
      { heading: "STOP 01 · LAST BUS", body: ["We said we would ride to the final stop just to see what was there.", "We never did. Somehow the imagined version became more detailed every time we mentioned it."] },
      { heading: "STOP 02 · ROOFTOP", body: ["The rooftop was always tomorrow: when the weather cleared, when everyone was free, when somebody remembered the key.", "Maybe some places survive because we never arrive and have to keep inventing them."] },
      { heading: "STOP 03 · RECORD SHOP", body: ["There was supposedly a record shop three streets over with a listening booth and a cat asleep in the window.", "Nobody could agree on the address. That made it better."] },
      { heading: "MAP NOTE", body: ["Not every missed plan is a regret.", "Some are tiny alternate universes you get to keep without having to live through the traffic."] },
    ],
  },
];

export default function ReadableBooks({ onBackToJournal }: { onBackToJournal: () => void }) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const book = BOOKS.find((item) => item.id === bookId) ?? null;

  function openBook(id: string) {
    setBookId(id);
    setPage(0);
  }

  if (!book) {
    return (
      <div className="books-library books-library-v23">
        <div className="library-heading">
          <div>
            <p>ROOM LIBRARY · {BOOKS.length} BOOKS</p>
            <h2>pick a book from the shelf</h2>
          </div>
          <button type="button" onClick={onBackToJournal}>← JOURNAL</button>
        </div>

        <div className="library-bookshelf">
          {BOOKS.map((item, index) => (
            <button key={item.id} type="button" className={`readable-book book-size-${index % 3}`} style={{ background: item.accent }} onClick={() => openBook(item.id)}>
              <span>{item.spine}</span>
            </button>
          ))}
        </div>

        <div className="library-book-cards">
          {BOOKS.map((item) => (
            <button key={item.id} type="button" onClick={() => openBook(item.id)}>
              <i style={{ background: item.accent }}>▤</i>
              <span><strong>{item.title}</strong><small>{item.subtitle}</small><em>{item.pages.length} pages</em></span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const current = book.pages[page];

  return (
    <div className="book-reader">
      <div className="book-reader-toolbar">
        <button type="button" onClick={() => setBookId(null)}>← LIBRARY</button>
        <span>{book.title}</span>
        <button type="button" onClick={onBackToJournal}>JOURNAL →</button>
      </div>

      <div className="open-readable-book">
        <div className="readable-page readable-page-left">
          <p className="reader-book-title">{book.title}</p>
          <p className="reader-subtitle">{book.subtitle}</p>
          <div className="reader-decoration" style={{ borderColor: book.accent }}>✦ ☾ ♫</div>
          <small>ROOM LIBRARY · COPY 01</small>
        </div>

        <article className="readable-page readable-page-right">
          <p className="reader-page-number">PAGE {page + 1} / {book.pages.length}</p>
          <h3>{current.heading}</h3>
          {current.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>
      </div>

      <div className="book-page-controls">
        <button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>← previous</button>
        <span>{page + 1} / {book.pages.length}</span>
        <button type="button" disabled={page === book.pages.length - 1} onClick={() => setPage((value) => value + 1)}>next →</button>
      </div>
    </div>
  );
}

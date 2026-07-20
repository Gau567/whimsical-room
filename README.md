# the room — cassette / CD player prototype

A working slice of the bigger "nostalgic desk" concept: drag a tape onto the
walkman or a disc onto the discman, hit ▶, it plays.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- **`lib/useYouTubePlayer.ts`** — a small hook around the YouTube IFrame
  Player API. Each physical player (cassette, CD) gets its own hidden,
  1×1px YouTube player instance as its "audio engine." This is the piece
  you'd swap out later if you move to uploaded audio files (Howler.js
  would slot in here instead, same hook shape: `load / play / pause /
  toggle / currentTime / duration`).
- **`components/DraggableTrack.tsx`** — the shelf item (tape shell or CD),
  built with `@dnd-kit/core`'s `useDraggable`.
- **`components/CassettePlayer.tsx`** / **`CDPlayer.tsx`** — droppable
  zones (`useDroppable`) that only accept their matching format
  (`track.format === "cassette" | "cd"`). Reels/disc spin via a CSS
  `animate-spin` tied to playback state; the CD player's lid slides open
  on drag-start for a little tactility.
- **`data/tracks.ts`** — sample playlist using well-known YouTube IDs as
  placeholders so it's testable immediately.

## Swapping in your real playlist

Edit `data/tracks.ts`. Each track needs:

```ts
{ id, title, artist, youtubeId, format: "cassette" | "cd", color }
```

`youtubeId` is just the `v=` param from a YouTube URL. `color` is a hex
value used for the tape shell / CD label tint.

## Known limits of this slice (by design — it's step one)

- No persistence yet — reload and the players are empty again. Wiring up
  Supabase (per your stack) for "rooms" and saved playlists is the
  natural next step, not part of this prototype.
- Only one track can be "in" each player at a time — no queue yet.
- Autoplay policies: some browsers block audio until the user has
  interacted with the page at least once; since ▶ is a real click, this
  should be fine in practice.
- Styling is intentionally room-agnostic for now — this is meant to sit
  inside the bigger desk scene (bookshelf, plant, window, polaroid wall)
  from your original brief, not replace it.

## GSAP polish (added)

`lib/motion.ts` holds the shared animation logic, kept separate from
the player components so both use the same physical feel:

- **`useSpin(ref, spinning)`** — reels and the CD don't just toggle a
  CSS spin class. They ramp `timeScale` from 0 → 1 over ~0.5s when
  playback starts (`power2.out`) and back down to 0 over ~0.7s when it
  stops (`power2.in`), so they read as having motor inertia rather
  than snapping on/off.
- **`playInsertBounce(el)`** — the tape/disc drops in with a
  `back.out` overshoot instead of a linear slide.
- **`playEjectOut(el, onComplete)`** — cassette eject now animates the
  tape sliding up and fading *before* the state clears (`onComplete`
  callback), instead of the DOM node just vanishing.
- **`useLid(ref, open)`** — the CD lid opens fast (`power3.out`) and
  closes with a small `back.in` overshoot, like a real hinge with a
  catch, plus the disc itself nudges down 6px and scales to 0.96 while
  the lid is open so it reads as "sitting in the tray."

Framer Motion is still the right tool for page/route-level transitions
later — GSAP owns anything physical inside the players so the two
don't fight over the same element.

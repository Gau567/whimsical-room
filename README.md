# The Nostalgia Room

An interactive retro bedroom built as a small digital place to explore rather than a traditional website.

The room is full of music, writing, memories, old media, games, drawers, hidden files, and small details that reward clicking around.

## Highlights

- **Physical music collections** — browse vinyl records, cassette tapes, and CD jewel cases, then click or drag them into their matching players.
- **Persistent playback** — music keeps playing while moving between the room, journal, computer, pinboard, books, and media views.
- **Connected memories** — pinboard memories can be linked to songs and reopened through the appropriate player.
- **Interactive writing** — a journal and tactile typewriter save writing locally; typewriter pages and journal notes can be pinned to the board.
- **Living pinboard** — create notes, upload photos, move and rotate memories, and keep everything between visits with localStorage.
- **Retro computer** — browse mail, photos, mixes, removable media, system files, and a collection of mini-games.
- **Removable media** — drawer floppies, a CD-R, and a game cartridge can be inserted into the computer and browsed like old drives.
- **Readable room content** — books, letters, tickets, receipts, journal prompts, drawer objects, and old emails all contain original text.
- **Hidden details** — poster secrets, unlockable mail, game cartridge content, and other small easter eggs reward exploration.
- **Accessibility details** — keyboard focus states, Escape navigation, reduced-motion support, and click alternatives to drag interactions.

## Built with

- Next.js
- React
- TypeScript
- Tailwind CSS
- GSAP
- `@dnd-kit/core`
- YouTube IFrame Player API for the current development music engine
- Browser `localStorage` / `sessionStorage` for lightweight persistence
- Web Audio API for generated interface sounds

## Run locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

For a production check:

```bash
npm run build
npm run start
```

## Project structure

```text
app/
  layout.tsx
  page.tsx
  globals.css
  icon.svg
  manifest.ts

components/
  CassettePlayer.tsx
  CDPlayer.tsx
  VinylPlayer.tsx
  PersistentMusicPlayer.tsx
  DraggableTrack.tsx
  TrackShelf.tsx

  room/
    RetroRoomScene.tsx
    RetroComputer.tsx
    RetroFileViewer.tsx
    StarMazeGame.tsx
    DeskDrawer.tsx
    PinBoard.tsx
    MiniTypewriter.tsx
    TypableJournal.tsx
    ReadableBooks.tsx

  stations/
    MediaStation.tsx

data/
  tracks.ts

lib/
  MusicPlayerContext.tsx
  useYouTubePlayer.ts
  useRoomSoundEffects.ts
  retroMedia.ts
  pinboard.ts
  motion.ts
  types.ts
```

## Music system

The site uses one persistent music context rather than mounting a new player for every view.

```text
MusicPlayerProvider
        │
        ├── vinyl player
        ├── cassette player
        ├── CD player
        ├── pinboard memories
        ├── computer playlists
        └── persistent bottom controls
```

That allows a song to continue playing when the visitor leaves a media screen and explores another part of the room.

After a browser refresh, the current track and approximate position can be restored in a paused state so the visitor can resume intentionally.

### Development audio note

The current prototype uses YouTube's IFrame Player API as its playback source. Video UI is kept out of the room interface; the website only exposes its own physical-player and now-playing controls.

For a public portfolio deployment, music availability can vary because individual YouTube uploads may be removed, restricted, or disallow embedding. Only use audio you have permission to present, and consider replacing the development playback layer with licensed/self-hosted audio before treating the site as a long-term public music experience.

## Local persistence

The project intentionally does not require a backend. Browser storage is used for things such as:

- journal drafts
- typewriter drafts
- pinboard positions and notes
- uploaded pinboard photos
- attached memory soundtracks
- removable computer media state
- read-mail progress
- discovered easter eggs
- music restoration information

Because this is browser-local data, clearing site storage will reset those saved details.

## Interaction tips

- Hover around the room; most recognizable objects are interactive.
- Music items can be clicked or dragged into their player.
- The long bottom player controls whichever track is currently active.
- Press **Escape** to return to the room from most focused views.
- Look through drawers instead of assuming every object is decorative.
- Read old mail and suspicious files.
- Some discoveries only appear after interacting with several related objects.

## Deployment on Vercel

1. Push the latest version to GitHub.
2. In Vercel, choose **Add New → Project**.
3. Import the GitHub repository.
4. Vercel should detect **Next.js** automatically.
5. Keep the default build command:

```text
next build
```

6. Deploy.

No environment variables are currently required for the core project.

After deployment, test music playback, browser refresh restoration, photo uploads, localStorage features, responsive layout, and all three physical media collections in the production URL.

## Portfolio summary

**The Nostalgia Room** is a front-end interaction project exploring how familiar physical objects can become navigation. Instead of using a conventional menu, the room itself is the interface: records lead to music, a CRT opens the computer, drawers contain removable media, a typewriter produces notes, and memories connect otherwise separate parts of the experience.

The project focuses on interaction design, state sharing between components, persistent client-side data, playful micro-interactions, and building a cohesive visual world with React rather than a collection of disconnected UI cards.

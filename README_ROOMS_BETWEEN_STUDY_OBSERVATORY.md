# The Rooms Between — Room Development README

> Current expansion documentation for the connected-room version of the Nostalgia Room project.

The original **Nostalgia Room** remains the anchor of the project. The expansion builds outward into a connected exploration world with a hallway, persistent inventory, quests, cross-room clues, room-specific mechanics, secrets, collectibles, and changing world state.

This README documents the two fully developed expansion rooms so far:

- **Room 02 — Midnight Study**
- **Room 04 — Observatory**

It also records how both rooms connect to the shared world systems.

---

## 1. Project Direction

The expansion is designed around one rule:

> **Every room should feel mechanically different, not just visually different.**

The current room identities are:

| Room | Theme | Core Interaction |
|---|---|---|
| Room 01 — Nostalgia Room | memory / music / old tech | dense object interaction, media, retro computer, typewriter |
| Room 02 — Midnight Study | deduction / codes / literature | investigate clues, read books, tune radio, unlock drawer |
| Room 03 — Arcade Room | skill / games / glitches | planned |
| Room 04 — Observatory | stars / coordinates / discovery | telescope exploration, constellation hunt, celestial puzzles |
| Room 05 — Dream Room | surreal logic / impossible spaces | planned |
| Room 06 — Train Compartment | narrative / travel / time | planned |
| Room 07 — Greenhouse | plants / environment / symbols | planned |

The hallway acts as the world hub and changes as room progress grows.

---

# 2. Shared World Systems

The expansion uses a shared world layer rather than treating each room as a completely independent page.

Core world systems include:

- `WorldContext`
- room navigation
- unlocked room state
- global inventory / Backpack
- Quest Log
- discovered clues
- completed quests
- persistent world progress
- global music control
- hallway reactions
- room-specific local progress where appropriate

Recommended structure:

```text
app/
├── globals.css
├── layout.tsx
├── page.tsx
└── styles/
    ├── world.css
    ├── world-hallway.css
    ├── world-hud.css
    ├── midnight-study.css
    └── observatory-room.css

components/
├── world/
│   ├── WorldHub.tsx
│   ├── RoomDoor.tsx
│   ├── WorldHUD.tsx
│   ├── Backpack.tsx
│   ├── QuestLog.tsx
│   └── WorldMusicControl.tsx
│
└── rooms/
    ├── study/
    │   └── MidnightStudy.tsx
    └── observatory/
        └── ObservatoryRoom.tsx

lib/
└── world/
    ├── WorldContext.tsx
    ├── worldTypes.ts
    └── worldQuests.ts
```

---

# 3. CSS Organisation

Room CSS is intentionally separated from `globals.css`.

`globals.css` should contain only genuinely global styles such as:

- reset / base styles
- global variables
- fonts
- shared body rules
- common utilities

Room-specific styling lives in separate files.

Example imports in `app/layout.tsx`:

```tsx
import "./globals.css";

import "./styles/world.css";
import "./styles/world-hallway.css";
import "./styles/world-hud.css";

import "./styles/midnight-study.css";
import "./styles/observatory-room.css";
```

This prevents the old `globals.css` file from becoming thousands of lines of tightly coupled room-specific CSS.

---

# 4. Global HUD

The global HUD remains available while moving between rooms.

It contains:

- **Backpack**
- **Quest Log**
- **compact global music controller**

The global music control uses the same music engine as Room 01, meaning music started in the Nostalgia Room can continue playing after the player leaves.

The player can therefore:

```text
Room 01
→ start a song
→ enter hallway
→ enter Midnight Study
→ enter Observatory
→ pause / resume the same song from the global HUD
```

The HUD is rendered above room switching logic rather than inside one individual room.

---

# 5. Room 02 — Midnight Study

## Identity

**Theme:** rainy / cerebral / warm desk light / dark wood

**Core loop:** investigate → read → connect clues → enter code → collect quest items

Visual language includes:

- rainy window
- warm banker lamp
- dark wooden desk
- rotary phone
- old radio
- books and reference material
- star chart
- clue board
- locked desk drawer
- scattered papers / study clutter
- atmospheric nighttime lighting

---

## 5.1 Main Puzzle

The central Midnight Study puzzle is the locked desk drawer.

The room repeatedly points toward:

```text
04 / 17
```

The four-digit code is:

```text
0417
```

Main flow:

```text
explore room
→ inspect notebook / star material
→ discover 04 / 17
→ recognise leading zero
→ enter 0417
→ drawer opens
```

The drawer password intentionally resets on page reload.

This means:

```text
reload page
→ drawer locks again
→ code input clears
```

World inventory does **not** reset with the drawer.

---

## 5.2 Drawer Rewards

The drawer contains two meaningful quest items.

### Telescope Lens

```text
◉ Telescope Lens
```

Purpose:

```text
Midnight Study
→ collect lens
→ Backpack
→ Observatory
→ install lens into telescope
```

This item is the direct cross-room bridge into Room 04.

### Small Brass Key

```text
⚿ Small Brass Key
```

The key carries a pressed-leaf association and points toward the future **Greenhouse**.

Its purpose is intentionally cross-room rather than immediately useful inside the Study.

---

## 5.3 Radio Puzzle

The radio is tunable.

Important frequency:

```text
104.7 FM
```

Finding it reveals the strange station and the Train breadcrumb:

```text
11:47
Platform Seven
```

The radio clue is recorded into world clue state so it can be referenced by later rooms.

---

## 5.4 Rotary Phone

The rotary phone provides another route toward the Train mystery.

It reinforces:

```text
11:47
Platform Seven
```

The repeated clue is deliberate.

The player can discover the Train thread through more than one Study interaction rather than relying on one single object.

---

## 5.5 Books and Study Material

The Study contains readable books / notes rather than purely decorative book spines.

Books and written material are used to:

- establish the room's tone
- provide indirect puzzle clues
- hint at later rooms
- reinforce dates, times, frequencies, astronomy, plants, and signals

The Study is intentionally more deduction-heavy than Room 01.

---

## 5.6 Investigation Board

The clue board is used as a discovery tracker rather than exposing all answers immediately.

Its clue categories include:

```text
CLOCK
DATE
RADIO
```

Example progression:

```text
CLOCK
11:47

DATE
???

RADIO
???
```

After notebook discovery:

```text
DATE
04 / 17
```

After radio discovery:

```text
RADIO
104.7
```

This lets the player visually see the mystery coming together.

---

## 5.7 Backpack Integration

Study rewards are stored in the global Backpack rather than a room-local inventory.

Typical inventory after solving the drawer:

```text
◉ Telescope Lens
⚿ Small Brass Key
```

The inventory persists across room changes and reloads through the world state system.

---

## 5.8 Study Quest / World Effects

Important Study discoveries can update:

- Quest Log
- unlocked rooms
- discovered clues
- inventory
- hallway state

Cross-room paths currently include:

```text
Telescope Lens
→ Observatory

Brass Key
→ Greenhouse thread

104.7 / 11:47 / Platform Seven
→ Train Compartment thread
```

---

## 5.9 Study Testing Checklist

Test:

```text
[ ] room loads without layout overlap
[ ] rain animation works
[ ] lamp toggles
[ ] notebook opens
[ ] clue board updates
[ ] radio tunes correctly
[ ] 104.7 reveals Train clue
[ ] phone opens and reveals Train clue
[ ] 0417 unlocks drawer
[ ] telescope lens enters Backpack
[ ] brass key enters Backpack
[ ] Observatory becomes available when expected
[ ] drawer resets after reload
[ ] Backpack items survive reload
[ ] hallway return works
```

---

# 6. Room 04 — Observatory

## Identity

**Theme:** midnight blue / warm brass / wood / moving sky / cozy astronomy

**Core loop:** repair telescope → explore sky → identify patterns → record anomalies → solve celestial puzzles → recover fragment

The Observatory is intentionally discovery-driven rather than another code-entry room.

Major visual elements include:

- large brass telescope
- observatory dome
- moving night sky
- wooden shelves
- astronomy books
- proper globe
- moon-phase dial
- orrery / solar-system model
- field notes
- Celestial Log
- constellation projector
- ladder
- lounge seating
- Observatory cat
- magical `BETWEEN` book

---

# 7. Telescope Repair

The Observatory telescope initially requires the quest item from Midnight Study.

Required item:

```text
◉ Telescope Lens
```

Flow:

```text
Midnight Study
→ collect Telescope Lens
→ Observatory
→ install lens
→ telescope repaired
```

Once installed, the telescope becomes the room's main exploration interface.

---

# 8. Navigable Telescope

The telescope is not a static image.

The player can:

- click / drag empty sky to pan
- move around a sky larger than the visible viewport
- use zoom controls
- inspect celestial targets
- identify constellations
- record rare anomalies
- use coordinates
- revisit recorded positions

A fixed crosshair stays in the telescope view while the sky moves beneath it.

The telescope displays coordinate-style information such as:

```text
RA ...
DEC ...
ZOOM ×...
```

The physical telescope also responds subtly to telescope movement.

---

# 9. Constellation Hunt

Constellations are spread across a larger sky rather than clustered together.

They are intentionally hidden among ordinary stars.

There are no giant circles saying where to click.

Before identification:

```text
✦       ·      ✦

     ✦

  ·        ✦
```

The player explores the sky and clicks actual constellation stars.

After identification, the constellation lines appear.

Current constellation pool includes:

- Orion
- Cassiopeia
- Ursa Major
- Cygnus
- Leo
- Scorpius
- Lyra
- Taurus
- Gemini
- Pegasus

The Celestial Log tracks identified patterns.

The Observatory completion requirement currently uses:

```text
at least 6 constellations identified
```

---

# 10. Celestial Objects

The telescope contains more than constellations.

Possible telescope discoveries include:

- Moon
- Andromeda
- Pleiades
- Saturn
- Jupiter
- Mars
- Orion Nebula
- Double Cluster
- Polaris
- Betelgeuse
- Rigel
- mystery / uncatalogued targets

Different targets may require different zoom levels before they can be properly inspected.

This gives the zoom mechanic an actual gameplay purpose.

---

# 11. Rare Telescope Sightings

Rare telescope events now have persistent consequences rather than disappearing after a notification.

Current rare events include:

### Meteor Crossing

Can be recorded in the Celestial Log.

Consequences include:

- research stamp
- recorded sighting
- Observatory wish counter effect

### Satellite Transit

Records the recurring time association:

```text
11:47
```

This helps connect the Observatory back into the wider building mystery.

### Unexpected Comet

Unlocks a persistent comet / ephemeris-style note.

The event can be observed multiple times.

### A Window Where No Room Should Be

This is the major rare Observatory secret.

Recording it can produce:

```text
▣ Sketch of an Impossible Window
```

The sketch becomes a Backpack item linked to the future Dream Room.

The magical `BETWEEN` book also changes after this event.

---

# 12. Celestial Log

The Observatory contains a persistent discovery log.

It tracks multiple categories:

```text
CONSTELLATIONS
CELESTIAL OBJECTS
LUNAR OBSERVATIONS
RARE SIGHTINGS
```

Rare events record:

- discovered event
- observation count
- archived field note
- research stamp
- recorded telescope coordinates where relevant

The player can reopen logged rare sightings instead of losing them permanently.

---

# 13. Globe

The Observatory globe is an interactive exploration object rather than decorative furniture.

Clicking / spinning it selects a random country and presents facts.

The globe uses a larger country pool and attempts to avoid immediate repetition.

Country cards can include:

- country
- capital
- general fact
- night-sky / astronomy-related fact

The same country can produce different fact combinations on later spins.

The globe exists primarily as an optional discovery interaction rather than a mandatory main quest.

---

# 14. Moon Observation System

The Moon Phase display is interactive.

Supported phases:

```text
new moon
waxing crescent
first quarter
waxing gibbous
full moon
waning gibbous
last quarter
waning crescent
```

The phase visual and label are driven by the same state.

The player can also open the lunar observation notebook and log phases.

---

# 15. April 17 Moon Puzzle

The final Observatory progression uses the recurring date:

```text
April 17
```

The lunar clue suggests the Moon is just past half-light.

Correct phase:

```text
waxing gibbous
```

Logging the correct phase completes the Moon portion of the Observatory sequence.

---

# 16. Coordinate Puzzle

The celestial drawer can produce the coordinate card:

```text
05h 35m
−05° 23′
```

The player must use the repaired telescope.

Required flow:

```text
take coordinate card
→ open telescope
→ pan toward correct region
→ zoom to at least ×1.8
→ lock coordinates
```

The telescope can provide directional hints when the player is too far away.

Successful alignment produces:

```text
COORDINATE LOCK

05h 35m · −05° 23′

something clicks inside the mount
```

This is one of the five required completion mechanisms.

---

# 17. Orrery / Interactive Solar System

The Observatory includes a manipulable orrery.

The player can:

- open the solar-system interface
- advance simulated time
- select planets
- read information
- manually change orbital position

Example controls include:

```text
+30 days
+180 days
```

The orrery is designed to support future planet-alignment puzzles without requiring a separate room system.

---

# 18. Constellation Projector

The constellation projector changes the atmosphere of the room and provides another way to interact with discovered sky patterns.

It can project constellation material across the Observatory and is intended to visually reward telescope exploration.

It also gives the Observatory a quieter, optional interaction that is not part of the main completion gate.

---

# 19. Astronomy Books

Books in the Observatory are readable reference material rather than decoration.

Current book themes include material such as:

- Star Atlas
- Orbits
- Light / starlight
- Celestial Maps
- Stars
- Comets
- Optics
- Time

These books provide:

- constellation guidance
- astronomy explanations
- telescope concepts
- orbital information
- coordinate help
- atmosphere / worldbuilding

The Star Atlas can support the constellation hunt without directly marking telescope targets.

---

# 20. The `BETWEEN` Book

One Observatory book appears unassuming at first.

Once opened, it flickers into a magical record of the building:

```text
THE ROOMS BETWEEN
```

It contains information and secrets about rooms in the building.

The book is designed to evolve as world progress changes.

It can react to:

- Observatory completion
- impossible telescope sightings
- future room discoveries
- fragment recovery

After the impossible-window sighting it may gain text such as:

```text
A seventh window has appeared
in the building plan.

It opens onto a room labelled only:

DREAM
```

After Observatory completion it records Room 04 as seen and acknowledges the recovered fragment.

---

# 21. Ladder and Cat

The Observatory contains optional environmental interactions.

### Ladder

The ladder is not purely decorative.

It can be used to access Observatory maintenance / secret material and provides room for optional notes and hidden discoveries.

### Observatory Cat

The cat is intentionally a personality / easter-egg interaction.

It can react differently across repeated clicks and Observatory progress.

The cat does not need to drive the primary quest.

Its purpose is to make the room feel inhabited rather than purely mechanical.

---

# 22. Observatory Completion Sequence

The complete Room 04 progression is:

```text
repair telescope
→ discover constellations
→ log rare sightings
→ solve moon phase
→ use coordinates
→ unlock Star Fragment
→ BETWEEN book changes
→ Observatory marked complete
→ hallway reacts
```

The completion console checks five mechanisms:

```text
✓ telescope repaired
✓ constellations identified
✓ rare sightings recorded
✓ April 17 moon solved
✓ coordinate lock achieved
```

Current thresholds:

```text
constellations:
at least 6

unique rare sightings:
at least 2
```

Once all conditions are met, the brass completion compartment opens.

---

# 23. Observatory Reward — Star Fragment

Final Room 04 reward:

```text
✦ STAR FRAGMENT
```

Description:

```text
A warm brass-edged shard of glass
that glows like a captured piece
of night sky.
```

The fragment is added to the global Backpack.

It is intended to contribute to the larger fragment / final-route system.

Completing the Observatory also completes its final quest:

```text
THE SKY REMEMBERS
```

---

# 24. Hallway Reaction

The hallway reacts after Observatory completion.

Possible world changes include:

- Observatory door gains star-like detail
- Observatory door shows fragment recovered
- hallway note appears
- faint constellation effect
- hallway whisper changes
- Dream Room door subtly reacts to the recovered Star Fragment

The Dream Room is teased rather than automatically opened.

Example hallway note:

```text
NEW INK · ROOM 04

one fragment remembers the sky ✦
```

---

# 25. Cross-Room Story So Far

The current implemented / seeded flow can be thought of as:

```text
ROOM 01
Nostalgia Room
        ↓

ROOM 02
Midnight Study
find 04 / 17
unlock drawer
        ↓
Telescope Lens
        ↓

ROOM 04
Observatory
repair telescope
explore sky
solve celestial sequence
        ↓
Star Fragment
        ↓
Dream Room begins reacting
```

Parallel Study threads also seed:

```text
104.7
11:47
Platform Seven
→ Train Compartment
```

and:

```text
Small Brass Key
pressed-leaf clue
→ Greenhouse
```

---

# 26. Persistence

## Global world state

World progression persists through the existing world-state storage.

Current global world state includes things such as:

- unlocked rooms
- Backpack items
- completed quests
- discovered clues
- Observatory completion
- Star Fragment

Current world storage key:

```text
whimsical-world-state-v2
```

## Observatory-specific progress

Observatory exploration progress uses:

```text
observatory-v11-progress
```

Rare telescope history may also use Observatory-specific stored state depending on the merged implementation.

## Midnight Study

The locked drawer itself is intentionally **not** persisted.

Reloading:

```text
drawer locked
code cleared
```

but collected world items remain in the global inventory.

---

# 27. Resetting Progress During Development

To reset the global world state:

```js
localStorage.removeItem("whimsical-world-state-v2");
location.reload();
```

To reset Observatory local progress:

```js
localStorage.removeItem("observatory-v11-progress");
location.reload();
```

If testing a version with an additional Observatory rare-event key, clear that key as well.

Use the browser's Application / Storage panel if you need to inspect all current localStorage entries.

---

# 28. Running the Project

Install dependencies if required:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Typical Next.js local URL:

```text
http://localhost:3000
```

If Turbopack appears to retain stale CSS / component output:

```bash
rm -rf .next
npm run dev
```

---

# 29. Recommended Testing Order

For a clean cross-room test:

```text
1. Reset world progress
2. Enter Midnight Study
3. Discover 04 / 17
4. Enter 0417
5. Collect Telescope Lens
6. Confirm lens appears in Backpack
7. Return to hallway
8. Enter Observatory
9. Install Telescope Lens
10. Identify at least 6 constellations
11. Record at least 2 unique rare telescope events
12. Solve April 17 Moon as waxing gibbous
13. Obtain coordinate card
14. Align telescope near 05h35m / −05°23′
15. Zoom to ×1.8+
16. Lock coordinates
17. Confirm completion compartment opens
18. Take Star Fragment
19. Open BETWEEN
20. Return to hallway
21. Confirm hallway and Dream door reactions
```

---

# 30. Git Workflow

## Midnight Study

Midnight Study should be merged into `world-expansion` once its current implementation is stable.

Typical completed-room flow:

```bash
git checkout room/midnight-study
git status
git add .
git commit -m "Complete Midnight Study room"
git push

git checkout world-expansion
git pull
git merge room/midnight-study
git push
```

Future Study enhancements should use a new branch instead of reopening the old completed-room branch.

Example:

```bash
git checkout world-expansion
git pull
git checkout -b enhancement/midnight-study-bookshelf
```

---

## Observatory

Current Observatory work lives on:

```text
room/observatory
```

After testing Room 04 completion:

```bash
git checkout room/observatory
git status

git add components/rooms/observatory/ObservatoryRoom.tsx
git add app/styles/observatory-room.css
git add components/world/WorldHub.tsx
git add app/styles/world-hallway.css
git add components/world/QuestLog.tsx
git add lib/world/worldTypes.ts
git add lib/world/worldQuests.ts

git commit -m "Complete Observatory progression and Star Fragment reward"
git push
```

Then merge:

```bash
git checkout world-expansion
git pull
git merge room/observatory
git push
```

The completed feature branch can remain in Git history.

---

# 31. Current Development Status

## Stable / built

```text
✓ Room 01 — Nostalgia Room
✓ Hallway / World Hub
✓ WorldContext
✓ global Backpack
✓ Quest Log
✓ global music controls
✓ Room 02 — Midnight Study
✓ Room 04 — Observatory
```

## Planned / next

```text
○ Room 03 — Arcade Room
○ Room 05 — Dream Room
○ Room 06 — Train Compartment
○ Room 07 — Greenhouse
○ final fragment / hidden-route system
```

---

# 32. Design Rules Going Forward

Keep these rules for future rooms:

1. **Different core mechanic per room.**
2. Keep Room 01 intact.
3. Use shared world systems only for genuinely shared state.
4. Use separate CSS files for each room.
5. Avoid putting room-specific styling back into `globals.css`.
6. Inventory should remain small and meaningful.
7. Cross-room clues should make sense locally too.
8. The hallway should visually react to meaningful progress.
9. Optional secrets should reward curiosity without blocking normal progression.
10. Each major room should eventually provide one meaningful fragment / reward.
11. Future rooms should react to items already discovered elsewhere.
12. Preserve completed rooms; add enhancements through new Git branches.

---

# 33. Current Narrative Threads

The connected mysteries currently include:

### April 17

```text
04 / 17
```

Introduced strongly in Midnight Study and echoed in Observatory lunar material.

### 11:47

Appears through:

- stopped clock
- radio
- phone
- satellite / Observatory anomaly material

Strongly associated with the future Train Compartment.

### Impossible Room / Dream

The Observatory can reveal:

```text
a window where no room should be
```

The `BETWEEN` book and impossible-window sketch begin pointing toward Dream Room.

### Fragments

Observatory provides:

```text
✦ Star Fragment
```

Fragments are intended to contribute toward the larger hidden-route / endgame structure.

---

# 34. Summary

**Midnight Study** is the project's deduction room.

Its strongest loop is:

```text
observe
→ read
→ connect
→ enter 0417
→ carry discoveries elsewhere
```

**Observatory** is the project's discovery room.

Its strongest loop is:

```text
repair
→ explore
→ identify
→ record
→ align
→ recover Star Fragment
```

Together they establish the intended structure of **The Rooms Between**:

> rooms that feel individually complete, but become much more interesting when their objects, clues and consequences travel across the building.

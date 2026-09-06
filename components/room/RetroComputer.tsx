"use client";

import { useEffect, useMemo, useState } from "react";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { PinItem, readPinboardItems } from "@/lib/pinboard";
import { Track } from "@/lib/types";
import { ejectRetroMedia, readInsertedMedia, RetroMediaDisk, RetroMediaFile } from "@/lib/retroMedia";
import RetroFileViewer from "@/components/room/RetroFileViewer";
import StarMazeGame from "@/components/room/StarMazeGame";

type AppName =
  | "home"
  | "mixes"
  | "mail"
  | "photos"
  | "games"
  | "guess"
  | "catch"
  | "fortune"
  | "memory"
  | "scramble"
  | "lights"
  | "drive"
  | "mailread"
  | "starmaze";

type Card = { id: number; symbol: string; matched: boolean };

type BuiltInMail = { id: string; subject: string; from: string; date: string; preview: string; body: string };

const BUILT_IN_MAIL: BuiltInMail[] = [
  {
    id: "welcome",
    subject: "WELCOME TO NOSTALGIA OS",
    from: "SYSTEM@ROOM.LOCAL",
    date: "09/06/95",
    preview: "A quick note before you start clicking absolutely everything...",
    body: "Welcome to NOSTALGIA OS 95.\n\nThis computer is connected to the room around it. Photos pinned to the board may appear in PHOTOS. Notes and journal pages can surface in MAIL. Songs attached to memories show up in MIXES.\n\nThere is no cloud sync, no algorithm, and absolutely no reason for the modem to make that noise.\n\nHave fun. Save often. Do not unplug mysterious disks while they are being read.",
  },
  {
    id: "future",
    subject: "RE: A NOTE FROM LATER",
    from: "FUTURE_YOU@SOMEWHERE.NET",
    date: "??/??/??",
    preview: "You are worrying about something that eventually becomes a funny story.",
    body: "Hey,\n\nYou are worrying about something right now that eventually becomes a story you tell while laughing. I cannot tell you which thing, because apparently time-travel email has rules.\n\nKeep the ticket stubs. Take more ordinary photos. Write down the tiny details because those are the first things memory edits out.\n\nAlso: that song you nearly skipped? Keep it.\n\n— you, eventually",
  },
  {
    id: "mixtape",
    subject: "MIXTAPE RULES.txt",
    from: "NO_REPLY@SIDE-A.FM",
    date: "07/18/98",
    preview: "Rule one: the first track has to make the person trust you.",
    body: "UNOFFICIAL MIXTAPE RULES\n\n1. The first track has to make the person trust you.\n2. Track three is where you show off.\n3. Never put your favourite song first. Make them earn it.\n4. Side B is allowed to get weird.\n5. Leave one song unexplained.\n6. Handwritten labels are mandatory.\n\nBonus rule: if you recorded it from the radio and the DJ talks over the intro, that is now part of the song forever.",
  },
  {
    id: "unsent",
    subject: "UNSENT_01.DRAFT",
    from: "ME@ROOM.LOCAL",
    date: "11:47 PM",
    preview: "I almost sent this, then decided some thoughts are allowed to stay unfinished.",
    body: "I almost sent this, then decided some thoughts are allowed to stay unfinished.\n\nNot everything needs a neat ending. Some days can just be a half-written note, a cold cup of coffee, and a song paused at 2:14.\n\nMaybe tomorrow I will know what I meant.\nMaybe I do not have to.",
  },
  {
    id: "arcade",
    subject: "ARCADE SCORE CHALLENGE",
    from: "PIXELPAL@ARCADE.BBS",
    date: "FRI 08:32",
    preview: "Your high score has been described as 'technically a score'.",
    body: "HELLO PLAYER,\n\nYour latest PIXEL.EXE score has been reviewed by the extremely serious Arcade Committee.\n\nVERDICT: technically a score.\n\nRecommended training schedule:\n- 3 rounds of PIXEL.EXE\n- 1 round of MEMORY.EXE\n- unnecessary confidence\n- snacks\n\nReport back when your reflexes are less decorative.",
  },
];

const SCRAMBLE_WORDS = ["cassette", "polaroid", "mixtape", "arcade", "journal", "vinyl", "typewriter", "nostalgia"];

function scrambleText(word: string) {
  let out = word;
  for (let tries = 0; tries < 8 && out === word; tries += 1) {
    out = word.split("").sort(() => Math.random() - 0.5).join("");
  }
  return out.toUpperCase();
}

function randomLights() {
  const board = Array.from({ length: 16 }, () => Math.random() > 0.48);
  return board.some(Boolean) ? board : board.map((_, i) => i % 3 === 0);
}


const symbols = ["📼", "💿", "☕", "🌙"];
const ALL_TRACKS = [...cassettes, ...cds, ...vinyls];

function shuffleCards(): Card[] {
  return [...symbols, ...symbols]
    .map((symbol, id) => ({ id, symbol, matched: false }))
    .sort(() => Math.random() - 0.5);
}

function itemLabel(item: PinItem) {
  return item.caption || item.text || item.icon || "untitled memory";
}

export default function RetroComputer({
  onBack,
  onOpenBoard,
  onPlayTrack,
}: {
  onBack: () => void;
  onOpenBoard: () => void;
  onPlayTrack: (track: Track) => void;
}) {
  const [app, setApp] = useState<AppName>("home");
  const [powerState, setPowerState] = useState<"booting" | "on" | "off">("booting");
  const [soundOn, setSoundOn] = useState(true);
  const [roomItems, setRoomItems] = useState<PinItem[]>([]);

  const [guess, setGuess] = useState("");
  const [guessMessage, setGuessMessage] = useState("pick a number from 1 to 20");
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 20) + 1);

  const [score, setScore] = useState(0);
  const [pixelPos, setPixelPos] = useState({ x: 42, y: 48 });
  const [fortuneSeed, setFortuneSeed] = useState(0);
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [selectedMail, setSelectedMail] = useState<{ subject: string; from: string; date: string; body: string } | null>(null);
  const [insertedMedia, setInsertedMedia] = useState<RetroMediaDisk | null>(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState<RetroMediaFile | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setPowerState("on"), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  function playComputerTone(kind: "click" | "open" | "eject" | "boot" | "error") {
    if (!soundOn || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const osc = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const tones = {
        click: [520, 0.035],
        open: [740, 0.055],
        eject: [260, 0.08],
        boot: [880, 0.12],
        error: [150, 0.12],
      } as const;
      const [freq, duration] = tones[kind];
      osc.frequency.setValueAtTime(freq, now);
      osc.type = kind === "error" ? "square" : "triangle";
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(kind === "boot" ? 0.045 : 0.025, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
      window.setTimeout(() => context.close().catch(() => undefined), 250);
    } catch {}
  }
  const [scrambleWord, setScrambleWord] = useState(() => SCRAMBLE_WORDS[0]);
  const [scrambleInput, setScrambleInput] = useState("");
  const [scrambleMessage, setScrambleMessage] = useState("unscramble the word");
  const [lights, setLights] = useState<boolean[]>(() => randomLights());
  const [lightMoves, setLightMoves] = useState(0);

  useEffect(() => {
    const refresh = () => setRoomItems(readPinboardItems([]));
    refresh();
    window.addEventListener("nostalgia-pinboard-updated", refresh);
    return () => window.removeEventListener("nostalgia-pinboard-updated", refresh);
  }, []);

  useEffect(() => {
    const refreshMedia = () => {
      const disk = readInsertedMedia();
      setInsertedMedia(disk);
      setSelectedMediaFile(null);
    };
    refreshMedia();
    window.addEventListener("nostalgia-media-inserted", refreshMedia);
    return () => window.removeEventListener("nostalgia-media-inserted", refreshMedia);
  }, []);

  const scrambledWord = useMemo(() => scrambleText(scrambleWord), [scrambleWord]);

  const photos = useMemo(() => roomItems.filter((item) => item.type === "photo"), [roomItems]);
  const mail = useMemo(
    () => roomItems.filter((item) => item.type === "letter" || item.type === "journal" || item.type === "note"),
    [roomItems],
  );

  const linkedTracks = useMemo(() => {
    const ids = new Set(roomItems.map((item) => item.linkedTrackId).filter(Boolean));
    return ALL_TRACKS.filter((track) => ids.has(track.id));
  }, [roomItems]);

  const mixGroups = useMemo(
    () => [
      { name: "TAPE BOX", subtitle: "soft, worn-in favourites", icon: "📼", tracks: cassettes },
      { name: "DISC CASE", subtitle: "bright 2000s energy", icon: "💿", tracks: cds },
      { name: "RECORD CRATE", subtitle: "warm late-night spins", icon: "◉", tracks: vinyls },
    ],
    [],
  );

  const fortunes = useMemo(
    () => [
      "you will rediscover something you forgot you loved.",
      "a tiny coincidence will feel suspiciously important.",
      "someone will mention a song you were already thinking about.",
      "you are one impulsive idea away from a very good story.",
      "a plan that looks silly on paper may actually be the right one.",
      "the thing you almost deleted is worth keeping.",
      "today has excellent side-quest energy.",
      "something old is about to feel new again.",
    ],
    [],
  );

  const luckyObjects = [
    "a forgotten receipt",
    "a green pen",
    "the third song in a playlist",
    "a sticker you nearly threw away",
    "an old screenshot",
    "a coin in the wrong pocket",
    "a half-finished notebook",
  ];

  const warnings = [
    "replying 'sure' when you absolutely mean no",
    "opening one more tab",
    "trusting a 2% battery",
    "re-reading a message twelve times",
    "making important decisions after midnight",
    "saying 'I'll remember it' instead of writing it down",
  ];

  const moods = ["soft chaos", "main-character static", "late-night clarity", "tiny victory", "nostalgic optimism", "side-quest mode"];

  const fortune = useMemo(() => {
    if (fortuneSeed === 0) return null;
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    return {
      omen: pick(fortunes),
      object: pick(luckyObjects),
      warning: pick(warnings),
      mood: pick(moods),
      lucky: Math.floor(Math.random() * 99) + 1,
      luck: Math.floor(Math.random() * 61) + 40,
      chaos: Math.floor(Math.random() * 81) + 20,
      romance: Math.floor(Math.random() * 91) + 10,
      track: String(Math.floor(Math.random() * 12) + 1).padStart(2, "0"),
    };
  }, [fortuneSeed, fortunes]);

  function resetScramble() {
    const next = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    setScrambleWord(next);
    setScrambleInput("");
    setScrambleMessage("unscramble the word");
  }

  function submitScramble() {
    if (scrambleInput.trim().toLowerCase() === scrambleWord) {
      setScrambleMessage("CORRECT — loading a fresh puzzle...");
      window.setTimeout(resetScramble, 650);
    } else {
      setScrambleMessage("not quite. the letters are judging you quietly.");
    }
  }

  function resetLights() {
    setLights(randomLights());
    setLightMoves(0);
  }

  function toggleLight(index: number) {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const affected = [index];
    if (row > 0) affected.push(index - 4);
    if (row < 3) affected.push(index + 4);
    if (col > 0) affected.push(index - 1);
    if (col < 3) affected.push(index + 1);
    setLights((current) => current.map((value, i) => affected.includes(i) ? !value : value));
    setLightMoves((value) => value + 1);
  }

  function openMail(message: { subject: string; from: string; date: string; body: string }) {
    setSelectedMail(message);
    setApp("mailread");
  }

  function openApp(next: AppName) {
    playComputerTone("open");
    if (next === "guess") {
      setTarget(Math.floor(Math.random() * 20) + 1);
      setGuess("");
      setGuessMessage("pick a number from 1 to 20");
    }
    if (next === "catch") {
      setScore(0);
      setPixelPos({ x: 42, y: 48 });
    }
    if (next === "fortune") setFortuneSeed((value) => value + 1);
    if (next === "memory") resetMemory();
    if (next === "scramble") resetScramble();
    if (next === "lights") resetLights();
    if (next === "drive") setSelectedMediaFile(null);
    setApp(next);
  }

  function submitGuess() {
    const value = Number(guess);
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      setGuessMessage("enter a whole number from 1 to 20");
      return;
    }
    if (value === target) {
      setGuessMessage(`ACCESS GRANTED — ${target} was correct! new number loaded.`);
      setTarget(Math.floor(Math.random() * 20) + 1);
      setGuess("");
      return;
    }
    setGuessMessage(value < target ? "too low... try higher" : "too high... try lower");
  }

  function catchPixel() {
    setScore((value) => value + 1);
    setPixelPos({
      x: 8 + Math.floor(Math.random() * 84),
      y: 10 + Math.floor(Math.random() * 78),
    });
  }

  function resetMemory() {
    setCards(shuffleCards());
    setFlipped([]);
    setMoves(0);
    setMemoryLocked(false);
  }

  function flipCard(index: number) {
    if (memoryLocked || cards[index].matched || flipped.includes(index)) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((value) => value + 1);
    const [a, b] = next;
    if (cards[a].symbol === cards[b].symbol) {
      setCards((current) => current.map((card, i) => (i === a || i === b ? { ...card, matched: true } : card)));
      setFlipped([]);
    } else {
      setMemoryLocked(true);
      window.setTimeout(() => {
        setFlipped([]);
        setMemoryLocked(false);
      }, 650);
    }
  }

  const desktopCount = photos.length + mail.length + linkedTracks.length;

  return (
    <section className="retro-computer-window computer-os computer-os-v12" aria-label="Retro computer">
      <div className="computer-window-bar">
        <span>NOSTALGIA OS 95</span>
        <div className="computer-title-actions">
          <button type="button" className="computer-sound-toggle" onClick={() => setSoundOn((value) => !value)} aria-label="Toggle computer sounds">{soundOn ? "SND" : "MUTE"}</button>
          <button type="button" onClick={() => { playComputerTone("click"); setPowerState("off"); }} aria-label="Shut down computer">⏻</button>
          <button type="button" onClick={onBack} aria-label="Close computer">×</button>
        </div>
      </div>

      <div className="computer-window-body computer-desktop">
        <div className="computer-scanlines" aria-hidden="true" />

        {powerState === "booting" && <div className="computer-boot-screen">
          <div className="boot-logo">NOSTALGIA<br/><span>OS 95</span></div>
          <pre>{`Memory test ........ 640K OK\nFloppy controller .. READY\nRoom archive ....... FOUND\nLoading desktop ....`}</pre>
          <div className="boot-progress"><i /></div>
        </div>}

        {powerState === "off" && <div className="computer-off-screen">
          <span>☾</span><h3>It is now safe to turn on your computer.</h3>
          <button type="button" onClick={() => { setPowerState("booting"); setApp("home"); playComputerTone("boot"); window.setTimeout(() => setPowerState("on"), 1200); }}>POWER ON</button>
        </div>}

        {powerState === "on" && app === "home" && (
          <div className="computer-home-screen computer-home-v12">
            <p className="computer-prompt">C:\ROOM\DESKTOP&gt; dir</p>
            <h2>GOOD!<br />things ahead.</h2>
            <p>{desktopCount > 0 ? `${desktopCount} room memories indexed.` : "Your room is quiet. Add some memories and come back."}</p>

            <div className="desktop-icons desktop-icons-v12">
              <button type="button" onClick={() => openApp("mixes")}><i>♫</i><span>mixes</span><small>{linkedTracks.length || ALL_TRACKS.length}</small></button>
              <button type="button" onClick={() => openApp("mail")}><i>✉</i><span>mail</span><small>{BUILT_IN_MAIL.length + mail.length}</small></button>
              <button type="button" onClick={() => openApp("games")}><i>☻</i><span>games</span><small>{insertedMedia?.id === "pixelquest-cart" ? 7 : 6}</small></button>
              <button type="button" onClick={() => openApp("photos")}><i>▣</i><span>photos</span><small>{photos.length}</small></button>
              {insertedMedia && <button type="button" className="desktop-drive-icon" onClick={() => openApp("drive")}><i>{insertedMedia.icon}</i><span>{insertedMedia.label.toLowerCase()}</span><small>DRIVE A:</small></button>}
            </div>
          </div>
        )}

        {powerState === "on" && app === "mixes" && (
          <div className="computer-app-panel computer-library-app">
            <div className="folder-topline"><p className="computer-prompt">C:\ROOM\MIXES&gt; dir</p><button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button></div>
            <h3>MIXES</h3>
            {linkedTracks.length > 0 && (
              <div className="computer-linked-strip">
                <span>MEMORY SOUNDTRACKS</span>
                {linkedTracks.map((track) => (
                  <button type="button" key={track.id} onClick={() => onPlayTrack(track)}>♫ {track.title}</button>
                ))}
              </div>
            )}
            <div className="computer-mix-grid">
              {mixGroups.map((group) => (
                <section key={group.name} className="computer-mix-folder">
                  <div><i>{group.icon}</i><strong>{group.name}</strong><span>{group.subtitle}</span></div>
                  <ul>
                    {group.tracks.map((track) => (
                      <li key={track.id}>
                        <button type="button" onClick={() => onPlayTrack(track)}>
                          <span>{track.title}</span><small>{track.artist}</small><b>PLAY</b>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        {powerState === "on" && app === "mail" && (
          <div className="computer-app-panel computer-library-app">
            <div className="folder-topline"><p className="computer-prompt">C:\ROOM\MAIL&gt; dir</p><button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button></div>
            <h3>MAIL</h3>
            <div className="mail-section-label">INBOX · {BUILT_IN_MAIL.length} messages</div>
            <div className="computer-mail-list">
              {BUILT_IN_MAIL.map((message) => (
                <button type="button" key={message.id} onClick={() => openMail(message)}>
                  <i>✉</i>
                  <span><strong>{message.subject}</strong><small>{message.from} · {message.preview}</small></span>
                  <b>›</b>
                </button>
              ))}
            </div>
            <div className="mail-section-label">ROOM NOTES · {mail.length}</div>
            {mail.length === 0 ? (
              <div className="computer-empty-state compact"><span>No room notes yet. Tear a journal page or type a note.</span><button type="button" onClick={onOpenBoard}>OPEN PINBOARD</button></div>
            ) : (
              <div className="computer-mail-list">
                {mail.slice().reverse().map((item, index) => (
                  <button type="button" key={item.id} onClick={() => openMail({
                    subject: `${item.type.toUpperCase()}_${String(index + 1).padStart(2, "0")}.TXT`,
                    from: item.source ? `${item.source.toUpperCase()}@ROOM.LOCAL` : "PINBOARD@ROOM.LOCAL",
                    date: new Date(item.createdAt).toLocaleDateString(),
                    body: item.text || item.caption || "An untitled room memory.",
                  })}>
                    <i>{item.type === "letter" ? "✉" : item.type === "journal" ? "▤" : "▪"}</i>
                    <span><strong>{item.type.toUpperCase()}_{String(index + 1).padStart(2, "0")}.TXT</strong><small>{itemLabel(item).slice(0, 78)}</small></span>
                    {item.linkedTrackId && <b>♫</b>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {powerState === "on" && app === "mailread" && selectedMail && (
          <div className="computer-app-panel mail-reader-app">
            <div className="folder-topline"><p className="computer-prompt">C:\ROOM\MAIL\MESSAGE.TXT</p><button type="button" className="retro-small-button" onClick={() => setApp("mail")}>← INBOX</button></div>
            <div className="mail-reader-head"><h3>{selectedMail.subject}</h3><p><b>FROM:</b> {selectedMail.from}<br/><b>DATE:</b> {selectedMail.date}</p></div>
            <pre className="mail-reader-body">{selectedMail.body}</pre>
          </div>
        )}

        {powerState === "on" && app === "photos" && (
          <div className="computer-app-panel computer-library-app">
            <div className="folder-topline"><p className="computer-prompt">C:\ROOM\PHOTOS&gt; dir</p><button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button></div>
            <h3>PHOTOS</h3>
            {photos.length === 0 ? (
              <div className="computer-empty-state"><i>▣</i><strong>NO PHOTOS FOUND</strong><span>Upload a Polaroid to the pinboard and it will appear here.</span><button type="button" onClick={onOpenBoard}>OPEN PINBOARD</button></div>
            ) : (
              <div className="computer-photo-grid">
                {photos.map((item) => {
                  const linked = ALL_TRACKS.find((track) => track.id === item.linkedTrackId);
                  return (
                    <button type="button" key={item.id} className="computer-photo-file" onClick={onOpenBoard}>
                      {item.image ? <img src={item.image} alt={item.caption || "Room memory"} /> : <span style={{ background: item.color }} />}
                      <strong>{item.caption || "untitled memory"}</strong>
                      <small>{linked ? `♫ ${linked.title}` : "POLAROID.JPG"}</small>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {powerState === "on" && app === "drive" && insertedMedia && (
          <div className="computer-app-panel drive-app">
            <div className="folder-topline"><p className="computer-prompt">A:\{insertedMedia.label}&gt; dir</p><button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button></div>
            <div className="drive-header"><i>{insertedMedia.icon}</i><div><h3>{insertedMedia.label}</h3><p>{insertedMedia.description}</p></div><button type="button" className="retro-small-button" onClick={() => { playComputerTone("eject"); ejectRetroMedia(); setInsertedMedia(null); setApp("home"); }}>EJECT</button></div>
            <div className="drive-layout">
              <div className="drive-file-list">
                {insertedMedia.files.map((file) => (
                  <button type="button" key={file.name} className={selectedMediaFile?.name === file.name ? "active" : ""} onClick={() => { playComputerTone("click"); setSelectedMediaFile(file); }}>
                    <i>{file.type === "text" ? "▤" : file.type === "image" ? "▣" : file.type === "playlist" ? "♫" : file.type === "log" ? "≣" : file.type === "data" ? "01" : "☻"}</i>
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>
              <div className="drive-preview">
                {selectedMediaFile ? (
                  <RetroFileViewer file={selectedMediaFile} tracks={ALL_TRACKS} onPlayTrack={onPlayTrack} onLaunchGame={() => openApp("starmaze")} />
                ) : <div className="drive-empty">Select a file to open it.</div>}
              </div>
            </div>
          </div>
        )}

        {powerState === "on" && app === "games" && (
          <div className="computer-app-panel games-folder">
            <div className="folder-topline"><p className="computer-prompt">C:\ROOM\GAMES&gt; dir</p><button type="button" className="retro-small-button" onClick={() => setApp("home")}>← DESKTOP</button></div>
            <h3>GAMES</h3>
            <div className="game-file-grid">
              <button type="button" onClick={() => openApp("guess")}><i>?</i><strong>GUESS.EXE</strong><span>number guesser</span></button>
              <button type="button" onClick={() => openApp("catch")}><i>✦</i><strong>PIXEL.EXE</strong><span>catch the pixel</span></button>
              <button type="button" onClick={() => openApp("fortune")}><i>☾</i><strong>ORACLE.EXE</strong><span>questionable wisdom</span></button>
              <button type="button" onClick={() => openApp("memory")}><i>▦</i><strong>MEMORY.EXE</strong><span>match the pairs</span></button>
              <button type="button" onClick={() => openApp("scramble")}><i>ABC</i><strong>SCRAMBLE.EXE</strong><span>unscramble lost words</span></button>
              <button type="button" onClick={() => openApp("lights")}><i>▦</i><strong>LIGHTS.EXE</strong><span>switch every light off</span></button>
              {insertedMedia?.id === "pixelquest-cart" && <button type="button" className="secret-game-file" onClick={() => openApp("starmaze")}><i>☄</i><strong>STARMAZE.EXE</strong><span>cartridge bonus unlocked</span></button>}
            </div>
          </div>
        )}

        {powerState === "on" && app === "guess" && (
          <div className="computer-app-panel">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\GUESS.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <h3>NUMBER GUESSER</h3><p>I picked a fresh secret number between 1 and 20.</p>
            <div className="guess-controls"><input value={guess} onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitGuess()} inputMode="numeric" aria-label="Your number guess" placeholder="1-20" /><button type="button" onClick={submitGuess}>ENTER</button></div>
            <div className="computer-status-line">{guessMessage}</div>
          </div>
        )}

        {powerState === "on" && app === "catch" && (
          <div className="computer-app-panel catch-app">
            <div className="catch-header"><div><p className="computer-prompt">C:\GAMES\PIXEL.EXE</p><h3>CATCH THE PIXEL</h3></div><div className="catch-actions"><strong>SCORE {String(score).padStart(2, "0")}</strong><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div></div>
            <p>click the glowing pixel. every hit moves it somewhere random.</p>
            <div className="pixel-field"><button type="button" className="catch-pixel" style={{ left: `${pixelPos.x}%`, top: `${pixelPos.y}%` }} onClick={catchPixel} aria-label="Catch pixel" /></div>
          </div>
        )}

        {powerState === "on" && app === "fortune" && (
          <div className="computer-app-panel fortune-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\ORACLE.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <h3>ORACLE 2.0</h3><div className="fortune-orb">◎</div>
            {fortune && <div className="fortune-card"><p className="fortune-omen">✦ SIGNAL RECEIVED ✦<br /><strong>{fortune.omen}</strong></p><div className="fortune-bars"><span>LUCK <i><b style={{ width: `${fortune.luck}%` }} /></i> {fortune.luck}%</span><span>CHAOS <i><b style={{ width: `${fortune.chaos}%` }} /></i> {fortune.chaos}%</span><span>ROMANCE <i><b style={{ width: `${fortune.romance}%` }} /></i> {fortune.romance}%</span></div><div className="fortune-details"><span><b>MOOD</b>{fortune.mood}</span><span><b>LUCKY NO.</b>{fortune.lucky}</span><span><b>LUCKY TRACK</b>track {fortune.track}</span><span><b>LUCKY OBJECT</b>{fortune.object}</span></div><p className="fortune-warning"><b>AVOID:</b> {fortune.warning}</p></div>}
            <button type="button" className="retro-run-button" onClick={() => setFortuneSeed((value) => value + 1)}>RUN AGAIN</button>
          </div>
        )}

        {powerState === "on" && app === "memory" && (
          <div className="computer-app-panel memory-game-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\MEMORY.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <div className="memory-game-heading"><div><h3>MEMORY MATCH</h3><p>find all four pairs.</p></div><strong>MOVES {String(moves).padStart(2, "0")}</strong></div>
            <div className="memory-grid">{cards.map((card, index) => { const visible = card.matched || flipped.includes(index); return <button key={card.id} type="button" className={`memory-tile ${visible ? "is-open" : ""}`} onClick={() => flipCard(index)} aria-label={visible ? card.symbol : "Hidden card"}>{visible ? card.symbol : "?"}</button>; })}</div>
            {cards.every((card) => card.matched) && <div className="computer-status-line">ALL PAIRS FOUND — nostalgia restored.</div>}
            <button type="button" className="retro-run-button" onClick={resetMemory}>NEW GAME</button>
          </div>
        )}

        {powerState === "on" && app === "scramble" && (
          <div className="computer-app-panel scramble-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\SCRAMBLE.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <h3>WORD SCRAMBLE</h3><p>recover the lost word from a very questionable disk sector.</p>
            <div className="scramble-word">{scrambledWord}</div>
            <div className="guess-controls"><input value={scrambleInput} onChange={(e) => setScrambleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitScramble()} placeholder="type the word" aria-label="Unscrambled word"/><button type="button" onClick={submitScramble}>CHECK</button></div>
            <div className="computer-status-line">{scrambleMessage}</div><button type="button" className="retro-run-button" onClick={resetScramble}>NEW WORD</button>
          </div>
        )}

        {powerState === "on" && app === "lights" && (
          <div className="computer-app-panel lights-app">
            <div className="folder-topline"><p className="computer-prompt">C:\GAMES\LIGHTS.EXE</p><button type="button" className="retro-small-button" onClick={() => setApp("games")}>← GAMES</button></div>
            <div className="memory-game-heading"><div><h3>LIGHTS OUT</h3><p>turn every square dark. clicking a light also flips its neighbours.</p></div><strong>MOVES {String(lightMoves).padStart(2, "0")}</strong></div>
            <div className="lights-grid">{lights.map((on, index) => <button type="button" key={index} className={on ? "is-on" : ""} onClick={() => toggleLight(index)} aria-label={`Light ${index + 1} ${on ? "on" : "off"}`} />)}</div>
            {!lights.some(Boolean) && <div className="computer-status-line">ALL LIGHTS OUT — suspiciously competent.</div>}
            <button type="button" className="retro-run-button" onClick={resetLights}>RANDOMIZE</button>
          </div>
        )}

        {powerState === "on" && app === "starmaze" && <StarMazeGame onBack={() => setApp("games")} />}
      </div>
    </section>
  );
}

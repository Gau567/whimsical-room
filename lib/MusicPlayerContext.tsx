"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cassettes, cds, vinyls } from "@/data/tracks";
import { Track } from "@/lib/types";
import {
  PlayerStatus,
  useYouTubePlayer,
} from "@/lib/useYouTubePlayer";

const SESSION_KEY = "nostalgia-room-global-player";

interface StoredPlayback {
  trackId: string;
  currentTime: number;
  wasPlaying: boolean;
}

interface MusicPlayerValue {
  currentTrack: Track | null;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  loadTrack: (track: Track, options?: { autoplay?: boolean; startAt?: number }) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  eject: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerValue | null>(null);

const allTracks = [...vinyls, ...cassettes, ...cds];

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const pendingAutoplayRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const restoredRef = useRef(false);

  const player = useYouTubePlayer("global-yt-engine");

  const loadTrack = useCallback(
    (track: Track, options?: { autoplay?: boolean; startAt?: number }) => {
      pendingAutoplayRef.current = options?.autoplay ?? false;
      pendingSeekRef.current =
        typeof options?.startAt === "number" && Number.isFinite(options.startAt)
          ? Math.max(0, options.startAt)
          : null;

      setCurrentTrack(track);
      player.load(track.youtubeId);
    },
    [player.load],
  );

  const eject = useCallback(() => {
    player.pause();
    setCurrentTrack(null);
    pendingAutoplayRef.current = false;
    pendingSeekRef.current = null;
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage can be unavailable in private/restricted browser modes.
    }
  }, [player.pause]);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;

      const stored = JSON.parse(raw) as StoredPlayback;
      const track = allTracks.find((candidate) => candidate.id === stored.trackId);
      if (!track) {
        window.sessionStorage.removeItem(SESSION_KEY);
        return;
      }

      // Browser autoplay policies make automatic sound after a refresh unreliable.
      // Restore the track and timestamp, but leave it paused until the user presses play.
      loadTrack(track, {
        autoplay: false,
        startAt: stored.currentTime || 0,
      });
    } catch {
      try {
        window.sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // Ignore storage failures.
      }
    }
  }, [loadTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    if (player.status !== "ready" && player.status !== "paused") return;

    if (pendingSeekRef.current !== null) {
      player.seek(pendingSeekRef.current);
      pendingSeekRef.current = null;
    }

    if (pendingAutoplayRef.current) {
      pendingAutoplayRef.current = false;
      player.play();
    }
  }, [currentTrack, player.status, player.seek, player.play]);

  useEffect(() => {
    if (!currentTrack) return;

    const snapshot: StoredPlayback = {
      trackId: currentTrack.id,
      currentTime: player.currentTime,
      wasPlaying: player.status === "playing",
    };

    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage failures; in-tab playback still works.
    }
  }, [currentTrack, player.currentTime, player.status]);

  const value = useMemo<MusicPlayerValue>(
    () => ({
      currentTrack,
      status: currentTrack ? player.status : "empty",
      currentTime: currentTrack ? player.currentTime : 0,
      duration: currentTrack ? player.duration : 0,
      isPlaying: Boolean(currentTrack && player.status === "playing"),
      loadTrack,
      play: player.play,
      pause: player.pause,
      toggle: player.toggle,
      eject,
    }),
    [
      currentTrack,
      player.status,
      player.currentTime,
      player.duration,
      player.play,
      player.pause,
      player.toggle,
      loadTrack,
      eject,
    ],
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {/* Keep YouTube as an audio engine only. The API replaces the target node
          with an iframe, so the *wrapper* must be hidden rather than relying
          on classes placed on the target element itself. */}
      <div className="global-youtube-audio-engine" aria-hidden="true">
        <div id="global-yt-engine" />
      </div>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  }
  return context;
}

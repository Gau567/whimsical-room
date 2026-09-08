"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RoomId, WorldRoomId } from "./worldTypes";

type WorldContextValue = {
  currentRoom: RoomId;
  unlockedRooms: WorldRoomId[];
  enterRoom: (room: WorldRoomId) => void;
  returnToHub: () => void;
  unlockRoom: (room: WorldRoomId) => void;
  lockRoom: (room: WorldRoomId) => void;
  isRoomUnlocked: (room: WorldRoomId) => boolean;
  resetWorld: () => void;
};

const STORAGE_KEY = "whimsical-world-progress-v1";

// While building Room 02, keep Nostalgia + Midnight Study open.
// Later you can remove "study" and unlock it through a quest instead.
const DEFAULT_UNLOCKED_ROOMS: WorldRoomId[] = ["nostalgia", "study"];

const WorldContext = createContext<WorldContextValue | undefined>(undefined);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<RoomId>("hub");
  const [unlockedRooms, setUnlockedRooms] = useState<WorldRoomId[]>(
    DEFAULT_UNLOCKED_ROOMS,
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        unlockedRooms?: WorldRoomId[];
      };

      const savedRooms: WorldRoomId[] = Array.isArray(parsed.unlockedRooms)
        ? parsed.unlockedRooms
        : [];

      setUnlockedRooms(
        Array.from(
          new Set<WorldRoomId>([
            ...DEFAULT_UNLOCKED_ROOMS,
            ...savedRooms,
          ]),
        ),
      );
    } catch {
      // Keep the default rooms unlocked if saved world data is invalid.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ unlockedRooms }),
      );
    } catch {
      // The world still works if localStorage is unavailable.
    }
  }, [unlockedRooms]);

  const isRoomUnlocked = useCallback(
    (room: WorldRoomId) => unlockedRooms.includes(room),
    [unlockedRooms],
  );

  const enterRoom = useCallback(
    (room: WorldRoomId) => {
      if (!isRoomUnlocked(room)) return;
      setCurrentRoom(room);
    },
    [isRoomUnlocked],
  );

  const returnToHub = useCallback(() => {
    setCurrentRoom("hub");
  }, []);

  const unlockRoom = useCallback((room: WorldRoomId) => {
    setUnlockedRooms((current) =>
      current.includes(room) ? current : [...current, room],
    );
  }, []);

  const lockRoom = useCallback((room: WorldRoomId) => {
    if (room === "nostalgia") return;

    setUnlockedRooms((current) => current.filter((item) => item !== room));
    setCurrentRoom((current) => (current === room ? "hub" : current));
  }, []);

  const resetWorld = useCallback(() => {
    setCurrentRoom("hub");
    setUnlockedRooms(DEFAULT_UNLOCKED_ROOMS);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo<WorldContextValue>(
    () => ({
      currentRoom,
      unlockedRooms,
      enterRoom,
      returnToHub,
      unlockRoom,
      lockRoom,
      isRoomUnlocked,
      resetWorld,
    }),
    [
      currentRoom,
      unlockedRooms,
      enterRoom,
      returnToHub,
      unlockRoom,
      lockRoom,
      isRoomUnlocked,
      resetWorld,
    ],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const context = useContext(WorldContext);

  if (!context) {
    throw new Error("useWorld must be used inside <WorldProvider>.");
  }

  return context;
}

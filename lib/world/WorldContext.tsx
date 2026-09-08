"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InventoryItem, RoomId } from "./worldTypes";

type WorldContextValue = {
  currentRoom: RoomId;
  unlockedRooms: RoomId[];
  inventory: InventoryItem[];
  enterRoom: (room: RoomId) => void;
  returnToHub: () => void;
  unlockRoom: (room: RoomId) => void;
  isRoomUnlocked: (room: RoomId) => boolean;
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;
};

const STORAGE_KEY = "whimsical-world-state-v1";
const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<RoomId>("hub");
  const [unlockedRooms, setUnlockedRooms] = useState<RoomId[]>([
    "hub",
    "nostalgia",
    "study",
  ]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          unlockedRooms?: RoomId[];
          inventory?: InventoryItem[];
        };
        if (saved.unlockedRooms?.length) setUnlockedRooms(saved.unlockedRooms);
        if (Array.isArray(saved.inventory)) setInventory(saved.inventory);
      }
    } catch {
      // Local persistence is optional.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ unlockedRooms, inventory }),
      );
    } catch {
      // Local persistence is optional.
    }
  }, [loaded, unlockedRooms, inventory]);

  function enterRoom(room: RoomId) {
    if (!unlockedRooms.includes(room)) return;
    setCurrentRoom(room);
  }

  function returnToHub() {
    setCurrentRoom("hub");
  }

  function unlockRoom(room: RoomId) {
    setUnlockedRooms((current) =>
      current.includes(room) ? current : [...current, room],
    );
  }

  function isRoomUnlocked(room: RoomId) {
    return unlockedRooms.includes(room);
  }

  function addItem(item: InventoryItem) {
    setInventory((current) =>
      current.some((existing) => existing.id === item.id)
        ? current
        : [...current, item],
    );
  }

  function removeItem(itemId: string) {
    setInventory((current) => current.filter((item) => item.id !== itemId));
  }

  function hasItem(itemId: string) {
    return inventory.some((item) => item.id === itemId);
  }

  function getItem(itemId: string) {
    return inventory.find((item) => item.id === itemId);
  }

  const value = useMemo<WorldContextValue>(
    () => ({
      currentRoom,
      unlockedRooms,
      inventory,
      enterRoom,
      returnToHub,
      unlockRoom,
      isRoomUnlocked,
      addItem,
      removeItem,
      hasItem,
      getItem,
    }),
    [currentRoom, unlockedRooms, inventory],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error("useWorld must be used inside WorldProvider");
  }
  return context;
}

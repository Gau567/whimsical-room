"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  InventoryItem,
  QuestId,
  RoomId,
  WorldClueId,
} from "./worldTypes";

type WorldContextValue = {
  currentRoom: RoomId;
  unlockedRooms: RoomId[];
  inventory: InventoryItem[];
  discoveredClues: WorldClueId[];
  completedQuests: QuestId[];

  enterRoom: (room: RoomId) => void;
  returnToHub: () => void;
  unlockRoom: (room: RoomId) => void;
  isRoomUnlocked: (room: RoomId) => boolean;

  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;

  discoverClue: (clue: WorldClueId) => void;
  hasClue: (clue: WorldClueId) => boolean;

  completeQuest: (quest: QuestId) => void;
  isQuestComplete: (quest: QuestId) => boolean;

  resetWorldProgress: () => void;
};

const STORAGE_KEY = "whimsical-world-state-v2";

const DEFAULT_UNLOCKED: RoomId[] = ["hub", "nostalgia", "study"];

const WorldContext = createContext<WorldContextValue | null>(null);

export function WorldProvider({ children }: { children: ReactNode }) {
  const [currentRoom, setCurrentRoom] = useState<RoomId>("hub");
  const [unlockedRooms, setUnlockedRooms] = useState<RoomId[]>(DEFAULT_UNLOCKED);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [discoveredClues, setDiscoveredClues] = useState<WorldClueId[]>([]);
  const [completedQuests, setCompletedQuests] = useState<QuestId[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        unlockedRooms?: RoomId[];
        inventory?: InventoryItem[];
        discoveredClues?: WorldClueId[];
        completedQuests?: QuestId[];
      };

      if (Array.isArray(saved.unlockedRooms) && saved.unlockedRooms.length) {
        setUnlockedRooms(saved.unlockedRooms);
      }
      if (Array.isArray(saved.inventory)) setInventory(saved.inventory);
      if (Array.isArray(saved.discoveredClues)) setDiscoveredClues(saved.discoveredClues);
      if (Array.isArray(saved.completedQuests)) setCompletedQuests(saved.completedQuests);
    } catch {
      // Broken/local browser storage should not prevent the world from loading.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          unlockedRooms,
          inventory,
          discoveredClues,
          completedQuests,
        }),
      );
    } catch {
      // Persistence is useful, but not required for the room to function.
    }
  }, [loaded, unlockedRooms, inventory, discoveredClues, completedQuests]);

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

  function discoverClue(clue: WorldClueId) {
    setDiscoveredClues((current) =>
      current.includes(clue) ? current : [...current, clue],
    );
  }

  function hasClue(clue: WorldClueId) {
    return discoveredClues.includes(clue);
  }

  function completeQuest(quest: QuestId) {
    setCompletedQuests((current) =>
      current.includes(quest) ? current : [...current, quest],
    );
  }

  function isQuestComplete(quest: QuestId) {
    return completedQuests.includes(quest);
  }

  function resetWorldProgress() {
    setCurrentRoom("hub");
    setUnlockedRooms(DEFAULT_UNLOCKED);
    setInventory([]);
    setDiscoveredClues([]);
    setCompletedQuests([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore browser storage restrictions.
    }
  }

  const value = useMemo<WorldContextValue>(
    () => ({
      currentRoom,
      unlockedRooms,
      inventory,
      discoveredClues,
      completedQuests,
      enterRoom,
      returnToHub,
      unlockRoom,
      isRoomUnlocked,
      addItem,
      removeItem,
      hasItem,
      getItem,
      discoverClue,
      hasClue,
      completeQuest,
      isQuestComplete,
      resetWorldProgress,
    }),
    [currentRoom, unlockedRooms, inventory, discoveredClues, completedQuests],
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

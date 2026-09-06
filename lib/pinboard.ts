export type PinItemType = "note" | "photo" | "ticket" | "letter" | "journal" | "keepsake";

export type PinItem = {
  id: string;
  type: PinItemType;
  text?: string;
  caption?: string;
  color?: string;
  image?: string;
  icon?: string;
  createdAt: number;
  x?: number;
  y?: number;
  rotation?: number;
  font?: "type" | "hand";
  linkedTrackId?: string;
  source?: "pinboard" | "typewriter" | "journal" | "drawer";
};

export const PINBOARD_STORAGE_KEY = "nostalgia-pinboard-items";

const placements = [
  { x: 8, y: 10 }, { x: 39, y: 11 }, { x: 68, y: 12 }, { x: 13, y: 48 },
  { x: 43, y: 49 }, { x: 70, y: 50 }, { x: 26, y: 30 }, { x: 57, y: 29 },
];

export function defaultPinPlacement(index: number) {
  return placements[index % placements.length];
}

export function normalizePinItems(items: PinItem[]): PinItem[] {
  return items.map((item, index) => {
    const fallback = defaultPinPlacement(index);
    return {
      ...item,
      x: typeof item.x === "number" ? item.x : fallback.x,
      y: typeof item.y === "number" ? item.y : fallback.y,
      rotation: typeof item.rotation === "number" ? item.rotation : ((index % 5) - 2) * 2,
    };
  });
}

export function readPinboardItems(fallback: PinItem[] = []): PinItem[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PINBOARD_STORAGE_KEY);
    if (!raw) return normalizePinItems(fallback);
    return normalizePinItems(JSON.parse(raw) as PinItem[]);
  } catch {
    return normalizePinItems(fallback);
  }
}

export function writePinboardItems(items: PinItem[]) {
  if (typeof window === "undefined") return;
  const normalized = normalizePinItems(items);
  window.localStorage.setItem(PINBOARD_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("nostalgia-pinboard-updated"));
}

export function addPinboardItem(item: Omit<PinItem, "id" | "createdAt" | "x" | "y" | "rotation"> & Partial<Pick<PinItem, "id" | "createdAt" | "x" | "y" | "rotation">>) {
  if (typeof window === "undefined") return null;
  const current = readPinboardItems([]);
  const placement = defaultPinPlacement(current.length);
  const next: PinItem = {
    id: item.id ?? `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: item.createdAt ?? Date.now(),
    x: item.x ?? placement.x,
    y: item.y ?? placement.y,
    rotation: item.rotation ?? ((current.length % 5) - 2) * 1.5,
    ...item,
  } as PinItem;
  writePinboardItems([...current, next]);
  return next;
}

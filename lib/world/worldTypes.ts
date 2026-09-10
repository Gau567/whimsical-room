export type RoomId =
  | "hub"
  | "nostalgia"
  | "study"
  | "arcade"
  | "observatory"
  | "dream"
  | "train"
  | "greenhouse";

export type RoomInfo = {
  id: RoomId;
  number: string;
  name: string;
  subtitle: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
  sourceRoom: Exclude<RoomId, "hub">;
  useIn?: Exclude<RoomId, "hub">;
};

export type WorldClueId =
  | "study-clock"
  | "study-date"
  | "study-radio"
  | "train-platform-seven"
  | "observatory-lens-found"
  | "observatory-lens-installed"
  | "observatory-constellation-solved"
  | "observatory-coordinate-found"
  | "observatory-moon-solved"
  | "observatory-coordinate-locked"
  | "observatory-star-fragment"
  | "observatory-complete"
  | "arcade-corrupted-save"
  | "arcade-nostalgia-disk"
  | "arcade-starlight-recognised"
  | "arcade-pixel-fragment"
  | "greenhouse-key-found";

export type QuestId =
  | "study-locked-drawer"
  | "observatory-missing-lens"
  | "observatory-star-wheel"
  | "observatory-complete"
  | "arcade-after-hours"
  | "train-eleven-forty-seven"
  | "greenhouse-small-key";

export const WORLD_ROOMS: RoomInfo[] = [
  { id: "nostalgia", number: "01", name: "The Nostalgia Room", subtitle: "music can be heard inside" },
  { id: "study", number: "02", name: "Midnight Study", subtitle: "the lamp is still on" },
  { id: "arcade", number: "03", name: "Arcade Room", subtitle: "something is still running" },
  { id: "observatory", number: "04", name: "Observatory", subtitle: "there is something in the sky" },
  { id: "dream", number: "05", name: "Dream Room", subtitle: "the door was not here before" },
  { id: "train", number: "06", name: "Train Compartment", subtitle: "departure unknown" },
  { id: "greenhouse", number: "07", name: "Greenhouse", subtitle: "rain against the glass" },
];

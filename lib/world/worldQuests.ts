import type { QuestId } from "./worldTypes";

export type QuestDefinition = {
  id: QuestId;
  title: string;
  room: string;
  hint: string;
};

export const WORLD_QUESTS: QuestDefinition[] = [
  {
    id: "study-locked-drawer",
    title: "The Locked Drawer",
    room: "Midnight Study",
    hint: "The study keeps repeating a date. Four-digit locks like leading zeroes.",
  },
  {
    id: "observatory-missing-lens",
    title: "A Missing Lens",
    room: "Observatory",
    hint: "A brass-edged lens from the Study looks like it belongs to an optical instrument.",
  },
  {
    id: "observatory-star-wheel",
    title: "The Celestial Lock",
    room: "Observatory",
    hint: "The observatory journal describes three symbols in a very specific order.",
  },
  {
    id: "train-eleven-forty-seven",
    title: "11:47 · Platform Seven",
    room: "Train Compartment",
    hint: "The stopped clock, strange radio station and rotary phone all repeat the same departure.",
  },
  {
    id: "greenhouse-small-key",
    title: "The Leaf-Tagged Key",
    room: "Greenhouse",
    hint: "The small brass key carries a pressed-leaf tag. Something wet probably owns the lock.",
  },
];

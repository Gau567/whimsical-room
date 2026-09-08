export type RoomId =
  | "hub"
  | "nostalgia"
  | "study"
  | "arcade"
  | "observatory"
  | "dream"
  | "train"
  | "greenhouse";

export type WorldRoomId = Exclude<RoomId, "hub">;

export type RoomDefinition = {
  id: WorldRoomId;
  number: string;
  title: string;
  subtitle: string;
};

export const WORLD_ROOMS: RoomDefinition[] = [
  {
    id: "nostalgia",
    number: "01",
    title: "The Nostalgia Room",
    subtitle: "music can be heard inside",
  },
  {
    id: "study",
    number: "02",
    title: "Midnight Study",
    subtitle: "the lamp is still on",
  },
  {
    id: "arcade",
    number: "03",
    title: "Arcade Room",
    subtitle: "something is still running",
  },
  {
    id: "observatory",
    number: "04",
    title: "Observatory",
    subtitle: "there is something in the sky",
  },
  {
    id: "dream",
    number: "05",
    title: "Dream Room",
    subtitle: "the door was not here before",
  },
  {
    id: "train",
    number: "06",
    title: "Train Compartment",
    subtitle: "departure unknown",
  },
  {
    id: "greenhouse",
    number: "07",
    title: "Greenhouse",
    subtitle: "rain against the glass",
  },
];

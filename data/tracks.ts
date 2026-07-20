import { Track } from "@/lib/types";

// NOTE: these are well-known, stable public YouTube IDs used only as
// placeholders so the player is testable out of the box. Swap in your
// own playlist — see README.md.
export const cassettes: Track[] = [
  {
    id: "c1",
    title: "Like we just met",
    artist: "NCT Dream",
    youtubeId: "eA9pwL-8wJw",
    format: "cassette",
    color: "#5C7A6B",
  },
  {
    id: "c2",
    title: "Shape of You",
    artist: "Ed Sheeran",
    youtubeId: "JGwWNGJdvx8",
    format: "cassette",
    color: "#B97A70",
  },
  {
    id: "c3",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    youtubeId: "kJQP7kiw5Fk",
    format: "cassette",
    color: "#C79A3E",
  },
];

export const cds: Track[] = [
  {
    id: "d1",
    title: "Gangnam Style",
    artist: "PSY",
    youtubeId: "9bZkp7q19f0",
    format: "cd",
    color: "#7A5C6E",
  },
  {
    id: "d2",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    youtubeId: "OPf0YbXqDm0",
    format: "cd",
    color: "#5C7A6B",
  },
  {
    id: "d3",
    title: "Counting Stars",
    artist: "OneRepublic",
    youtubeId: "hT_nvWreIhg",
    format: "cd",
    color: "#B97A70",
  },
];

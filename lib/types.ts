export type MediaFormat = "cassette" | "cd";

export interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  format: MediaFormat;
  /** accent color for the physical item (tape shell / disc label) */
  color: string;
}

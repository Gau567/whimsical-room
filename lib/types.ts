export type MediaFormat = "cassette" | "cd" | "vinyl";

export interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  format: MediaFormat;
  /** accent color for the physical item */
  color: string;
}

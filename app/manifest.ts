import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Nostalgia Room",
    short_name: "Nostalgia Room",
    description:
      "An interactive retro bedroom filled with music, memories, writing, games, and hidden details.",
    start_url: "/",
    display: "standalone",
    background_color: "#2b172a",
    theme_color: "#2b172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

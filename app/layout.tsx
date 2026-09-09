import type { Metadata, Viewport } from "next";

import "./globals.css";
import "./styles/world.css";
import "./styles/world-hallway.css";
import "./styles/midnight-study.css";
import "./styles/world-hud.css";
import "./styles/observatory-room.css";

export const metadata: Metadata = {
  title: {
    default: "The Nostalgia Room",
    template: "%s · The Nostalgia Room",
  },
  description:
    "An interactive retro bedroom filled with records, cassettes, CDs, memories, journals, games, drawers, and small things worth finding.",
  keywords: [
    "interactive website",
    "retro web design",
    "nostalgia room",
    "Next.js",
    "TypeScript",
    "creative coding",
    "portfolio project",
  ],
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#2b172a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Spectral:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-serif">{children}</body>
    </html>
  );
}

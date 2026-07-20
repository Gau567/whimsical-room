import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "the room",
  description: "a little desk of tapes, discs, and things you left behind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Spectral:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-serif">{children}</body>
    </html>
  );
}

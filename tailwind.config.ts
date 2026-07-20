import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        walnut: {
          950: "#1A130E",
          900: "#241A13",
          800: "#3B2A1E",
          700: "#4A3626",
        },
        paper: "#EDE4D3",
        cream: "#F1E9DA",
        amber: {
          400: "#F0B457",
          500: "#E8A33D",
          600: "#C97F27",
        },
        tape: {
          teal: "#5C7A6B",
          rose: "#B97A70",
          mustard: "#C79A3E",
          plum: "#7A5C6E",
        },
        ink: "#241A13",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        hand: ["var(--font-hand)", "cursive"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        deck: "0 20px 60px -20px rgba(0,0,0,0.6)",
        inset: "inset 0 2px 6px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;

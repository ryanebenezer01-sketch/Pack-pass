import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark-themed dashboard palette (see UI/UX design notes).
        background: "#0a0a0a",
        surface: "#101012",
        card: "#141417",
        border: "#26262b",
        muted: "#8a8a93",
        foreground: "#ededf0",
        accent: {
          DEFAULT: "#6d5efc",
          foreground: "#ffffff",
        },
        success: "#3ecf8e",
        warning: "#f5a524",
        danger: "#f55353",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

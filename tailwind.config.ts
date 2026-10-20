import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          950: "#06132B",
          900: "#06132B",
          800: "#06132B",
        },
        embassyGold: "#DEC378",
        brightGold: "#DEC378",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
      },
      boxShadow: {
        glow: "0 22px 70px rgba(6, 19, 43, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

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
          950: "#0f2b4d",
          900: "#16365e",
          800: "#1e3a5f"
        },
        embassyGold: "#d4af37",
        brightGold: "#f5c518"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "serif"]
      },
      boxShadow: {
        glow: "0 22px 70px rgba(15, 43, 77, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

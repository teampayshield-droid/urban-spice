import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0a0908",
          900: "#121110",
          800: "#1b1918",
          700: "#252220",
        },
        accent: {
          400: "#f5a742",
          500: "#e8912b",
          600: "#d17d1c",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

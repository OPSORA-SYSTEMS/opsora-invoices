import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#1a0a2e",
          accent: "#e91e8c",
          highlight: "#f8b4d9",
          surface: "#ffffff",
          surface2: "#fdf2f8",
          textDark: "#1a0a2e",
          textMuted: "#6b7280",
          border: "#f3d4e8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

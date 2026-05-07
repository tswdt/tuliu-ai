import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7C3AED",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        cyber: {
          bg: "#070A12",
          surface: "#0B1020",
          card: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          purple: "#7C3AED",
          cyan: "#06B6D4",
          electric: "#22D3EE",
          text: "#F8FAFC",
          muted: "#94A3B8",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7C3AED, #06B6D4)",
        "gradient-brand-hover": "linear-gradient(135deg, #6D28D9, #0891B2)",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124,58,237,0.4)",
        "glow-cyan": "0 0 20px rgba(6,182,212,0.4)",
        "glow-brand": "0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(6,182,212,0.2)",
        "glass": "0 4px 30px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

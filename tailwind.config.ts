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
        // SRS §3.1 module colour coding
        account: {
          DEFAULT: "#14532d", // dark green — account structure
          light: "#dcfce7",
        },
        daily: {
          DEFAULT: "#16a34a", // green — daily records
          light: "#dcfce7",
        },
        money: {
          DEFAULT: "#d97706", // amber — money, stock, sales
          light: "#fef3c7",
        },
        insight: {
          DEFAULT: "#2563eb", // blue — insight & reporting
          light: "#dbeafe",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

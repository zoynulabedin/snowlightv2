import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "Snowlight-red": "#ff0000",
        "Snowlight-pink": "#ff1493",
        "Snowlight-purple": "#8b5cf6",
        "Snowlight-dark": "#1a1a1a",
        "Snowlight-gray": "#f5f5f5",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "system-ui", "sans-serif"],
      },
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
        ultra: "2560px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

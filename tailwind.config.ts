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
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;

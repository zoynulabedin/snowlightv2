/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bugs-pink': '#ff1493',
        'bugs-purple': '#8b5cf6',
        'bugs-dark': '#1a1a1a',
        'bugs-gray': '#f5f5f5',
      },
      fontFamily: {
        'sans': ['Noto Sans KR', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


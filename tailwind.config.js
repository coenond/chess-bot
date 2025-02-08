module.exports = {
  darkMode: 'media', // 'media' for system preference, 'class' for manual toggle
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-mono': ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
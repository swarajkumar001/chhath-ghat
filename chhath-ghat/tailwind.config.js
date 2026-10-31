/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#F28C28',
        gold: '#F5C04A',
        deepred: '#8E1B1B',
        earth: '#6B4226',
        river: '#1F4E6B',
        dusk: '#E8798A',
        dawn: '#FFD98A',
      },
      fontFamily: {
        display: ['"Tiro Devanagari Hindi"', 'serif'],
        sans: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#FAF8F5',
        charcoal: '#1C1C1C',
        wood: '#B08968',
        'wood-light': '#D0B18F',
        stone: '#858178',
        'stone-light': '#E6E0D8',
      },
      fontFamily: { display: ['Playfair Display', 'Georgia', 'serif'] },
    },
  },
  plugins: [],
};

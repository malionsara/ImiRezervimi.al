/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'albanian-red': '#E31837',
        'albanian-black': '#000000',
      },
      fontFamily: {
        'albanian': ['Inter', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
      },
    },
  },
  plugins: [],
}
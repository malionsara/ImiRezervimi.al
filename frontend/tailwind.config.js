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
      },
    },
    plugins: [],
  }
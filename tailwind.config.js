/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4F7F5', // Off-white with a hint of mint
        secondary: '#E1E8E3', // Soft Sage
        accent: {
          green: '#2C5F2D', // Forest Green
          teal: '#008B8B', // Dark Cyan / Teal
        },
        slate: '#2F4F4F', // Dark Slate Grey
      },
      fontFamily: {
        sans: ['Inter', 'San Francisco', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

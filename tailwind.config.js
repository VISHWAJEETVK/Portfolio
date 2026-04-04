/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: {
          green: 'rgb(var(--color-accent-green) / <alpha-value>)',
          teal: 'rgb(var(--color-accent-teal) / <alpha-value>)',
        },
        slate: 'rgb(var(--color-slate) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'San Francisco', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

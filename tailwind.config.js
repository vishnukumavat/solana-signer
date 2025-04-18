/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solana-purple': '#BE9EFF',
        'solana-blue': '#7DFAC7',
        'solana-green': '#7DFAC7',
        'solana-lightPurple': '#E5D8FF',
        'solana-lightBlue': '#C3FFEA',
        'solana-darkBlue': '#1E1E24',
        'solana-black': '#000000',
        'solana-white': '#FFFFFF',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}


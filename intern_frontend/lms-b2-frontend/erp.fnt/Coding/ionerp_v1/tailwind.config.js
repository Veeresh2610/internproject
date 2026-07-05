/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Add this line
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#3B82F6",
          dark: "#60A5FA",
        },
        background: {
          light: "#0077b6",
          dark: "#1F2937",
        },
        text: {
          light: "#1F2937",
          dark: "#F9FAFB",
        },
        border: {
          light: "#E5E7EB",
          dark: "#4B5563",
        },
        ring: {
          light: "#93C5FD",
          dark: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
        serif: ["Roboto", "serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

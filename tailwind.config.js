/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "dog-wallpaper": "url('public/dog-wallpaper.jpeg')",
      },
    },
  },
  plugins: [],
};

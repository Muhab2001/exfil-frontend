/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  prefix: "t-",
  plugins: [],
  important: true,
};

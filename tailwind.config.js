const defaultOptions = require("@sanger/ui-styling/tailwind.config");

module.exports = {
  ...defaultOptions,
  purge: {
    ...defaultOptions.purge,
    content: ["./src/**/*.{html,tsx}"],
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
  important: true,
};

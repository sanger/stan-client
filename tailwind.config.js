const defaultOptions = require("@sanger/ui-styling/tailwind.config");

module.exports = {
  ...defaultOptions,
  content: {
    ...defaultOptions.content,
    content: ["./src/**/*.{html,tsx}"],
  },
  corePlugins: {},
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
  important: false,
};

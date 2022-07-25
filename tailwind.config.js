const defaultOptions = require("@sanger/ui-styling/tailwind.config");

module.exports = {
  ...defaultOptions,
  purge: {
    ...defaultOptions.purge,
    content: ["./src/**/*.{html,tsx}"],
  },
  important: true,
};

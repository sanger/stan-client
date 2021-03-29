import "../src/styles/index.css";
import { enableAllPlugins } from "immer";
enableAllPlugins();

// Start the mocking when each story is loaded.
if (typeof global.process === "undefined") {
  const { worker } = require("../src/mocks/mswSetup");

  let startOptions;

  if (window.location.origin.indexOf("github") !== -1) {
    startOptions = {
      serviceWorker: {
        url: "/stan-client/mockServiceWorker.js",
        options: {
          scope: "/stan-client/",
        },
      },
    };
  }

  // Repetitive calls to the `.start()` method do not register a new worker,
  // but check whether there's an existing once, reusing it, if so.
  worker.start(startOptions);
}

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

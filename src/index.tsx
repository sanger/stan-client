import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";

/**
 * Setup MockServiceWorker if `REACT_APP_MOCK_API` is set to `msw`
 * Call the `postMSWStart` if there is one defined
 * @see cypress/support/commands.ts
 */
async function prepare() {
  if (process.env.REACT_APP_MOCK_API === "msw") {
    const { worker } = require("./mocks/browser");
    const { graphql } = require("msw");
    await worker.start();
    if (window.postMSWStart) {
      window.postMSWStart(worker, graphql);
    }
  }
}

prepare().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

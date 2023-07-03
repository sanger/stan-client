import "../src/styles/index.css";
import { enableAllPlugins } from "immer";
enableAllPlugins();

/**
Starting from Storybook 7, the behavior for Service Workers has changed.
Instead of using a dedicated file like mockServiceWorker.js, Storybook now uses a built-in mechanism called storybook-preset-create-react-app.
This preset automatically registers a Service Worker for you when running Storybook.

Remove the previous Service Worker setup: If you have any custom Service Worker registration code or references to mockServiceWorker.js
 in your Storybook configuration or code, remove them. You no longer need to explicitly register a Service Worker with Storybook 7+.
 **/

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

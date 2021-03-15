import "../src/styles/index.css";
import { enableAllPlugins } from "immer";
import { worker } from "../src/mocks/mswSetup";

enableAllPlugins();
worker.start();

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

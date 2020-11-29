import { setupWorker, graphql } from "msw";
import { handlers } from "../mocks/handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

window.msw = {
  worker,
  graphql,
};

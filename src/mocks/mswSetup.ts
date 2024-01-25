import { graphql } from 'msw';
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

window.msw = {
  worker,
  graphql
};

// jest.polyfills.js
/**
 * Request/Response/TextEncoder is not defined (Jest) Error with msw update to 2.0 - This issue is caused by your environment not having the Node.js globals for one reason or another.
 * This commonly happens in Jest because it intentionally robs you of Node.js globals and fails to re-add them in their entirely. As the result, you have to explicitly add them yourself.
 *
 * Create a jest.polyfills.js file next to your jest.config.js with the following content:
 * https://mswjs.io/docs/faq/
 *
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact order
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */
const { TransformStream } = require('node:stream/web');
const { BroadcastChannel } = require('worker_threads');
const { fetch } = require('cross-fetch');

Object.defineProperties(globalThis, {
  fetch: { value: fetch, writable: true },
  TransformStream: { value: TransformStream },
  BroadcastChannel: { value: BroadcastChannel }
});

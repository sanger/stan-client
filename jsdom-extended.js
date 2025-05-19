/**
 * Request/Response/TextEncoder is not defined (Jest) Error with msw update to 2.0 - This issue is caused by your environment not having the Node.js globals for one reason or another.
 * This commonly happens in Jest because it intentionally robs you of Node.js globals and fails to re-add them in their entirely. As the result, you have to explicitly add them yourself.
 *
 * We create a file “jsdom-extended.js” and set this file as testEnvironment in “jest.config.js”
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

const JSDOMEnvironment = require('jest-environment-jsdom').default;
class JSDOMEnvironmentExtended extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);

    this.global.ReadableStream = ReadableStream;
    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;

    this.global.Blob = Blob;
    this.global.File = File;
    this.global.Headers = Headers;
    this.global.FormData = FormData;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.structuredClone = structuredClone;

    this.global.BroadcastChannel = BroadcastChannel;
    this.global.TransformStream = TransformStream;
  }
}

module.exports = JSDOMEnvironmentExtended;

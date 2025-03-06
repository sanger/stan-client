// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import { server } from './mocks/server';

global.fetch = require('node-fetch');
beforeAll(() => server.listen()); // Start the server when test starts
afterEach(() => server.resetHandlers()); // Reset any runtime request handlers we may add during the tests.
afterAll(() => server.close()); // Clean up once the tests are done.

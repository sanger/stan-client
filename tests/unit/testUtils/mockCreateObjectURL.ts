// Utility to mock and restore URL.createObjectURL and URL.revokeObjectURL for jsdom environment

let originalCreateObjectURL: typeof global.URL.createObjectURL | undefined;
let originalRevokeObjectURL: typeof global.URL.revokeObjectURL | undefined;

export function mockCreateObjectURL() {
  beforeAll(() => {
    originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    global.URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    if (originalCreateObjectURL) {
      global.URL.createObjectURL = originalCreateObjectURL;
    } else {
      // @ts-expect-error: createObjectURL may not exist
      delete global.URL.createObjectURL;
    }
    if (originalRevokeObjectURL) {
      global.URL.revokeObjectURL = originalRevokeObjectURL;
    } else {
      // @ts-expect-error: revokeObjectURL may not exist
      delete global.URL.revokeObjectURL;
    }
  });
}

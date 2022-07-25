# Stan (Client)

![CI](https://github.com/sanger/stan-client/workflows/Test/badge.svg)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Dependencies

- `Node v16.15.1`
- `Yarn v1.22.11`

## Getting Started

To install the dependencies for the project, you can run:

### `yarn`

In order for `graphql-codegen` to generate TypeScript types to match the GraphQL schema, create a `.env.local` file in the root of the project and include the property `GRAPHQL_SCHEMA_PATH`:

    GRAPHQL_SCHEMA_PATH=/path/to/schema.graphqls

## Front-end Architecture
The architecture of the front-end is split into 3 layers:

[comment]: <> (![Front-end Architecture]&#40;public/frontend_architecture.png&#41;)

- **UI (React)** - The user interface are the pages and components that make up the application. Built with React, they contain no application logic.

- **Data Model (XState)** - STAN client state management uses [XState](https://xstate.js.org/docs/), a library for building StateCharts.

- **Core SDK** - The SDK (which uses [graphql-request](https://github.com/prisma-labs/graphql-request)) is generated as part of `graphql-codegen` described above. handles all communication between STAN client and STAN core.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

It will also watch for any changes in the GraphQL schema, or in the queries and mutations in the `graphql` directory. It will automatically rebuild the graphql TypeScript types on any change. See `yarn codegen` below for more details.

### `yarn start:msw`

Runs the app in the development mode with MockServiceWorker enabled (see below).<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

There is some special behaviour built in for the labware handlers when using MSW. When searching for a piece of labware by barcode, the number after the `-` will determine the labware type returned. The number following that will determine how many samples will be in each slot of the labware.

The current list of labware types and their order can be found in the `labwareTypeFactory.ts`.

Examples:

```
STAN-1111 // Proviasette (1) with 1 sample in each slot
STAN-4089 // Visium LP (4) with 0 samples in each slot
```

### `yarn codegen`

Runs the [GraphQL Code Generator](https://graphql-code-generator.com/docs/getting-started/index). This command automatically runs before `yarn start`, `yarn start:msw`, and `yarn test:open`. 

GraphQL Code Generator is a CLI tool that can generate TypeScript typings out of a GraphQL schema.

Its configuration lives in `codegen.yml`. Its output goes into the `/types` directory.

### `yarn test:open`

Starts the app on [http://localhost:3001](http://localhost:3001) with `REACT_APP_MOCK_API=msw` then launches the [Cypress](https://www.cypress.io/) test runner.

When the environment variable `REACT_APP_MOCK_API` is set to `msw`, after the application loads up it will also start [Mock Service Worker](https://mswjs.io/docs/). This allows all requests to the API to be mocked at the network level. The message `[MSW] Mocking enabled.` will be shown in the browser's javascript console.

By default, when using `cy.visit()` to visit a page in `cypress`, the user is already logged in. To visit as a guest, use `cy.visitAsGuest()` method.

The default handlers for `msw` are in `/src/mocks/handlers.ts`.

If using IntelliJ, install the [Cypress](https://plugins.jetbrains.com/plugin/13819-cypress-support) plugin to allow running tests inside the IDE.

### `yarn test`

Does the same as `yarn test:open` but runs all `cypress` tests on the command line, instead of using its launcher.

### `yarn storybook`

Runs [Storybook](https://storybook.js.org/docs/react/get-started/introduction). The development server will need to be simultaneously running in a separate process to build the CSS.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Useful Links

- graphql-request: https://github.com/prisma-labs/graphql-request
- Learn about cypress: https://docs.cypress.io/guides/overview/why-cypress.html#In-a-nutshell
- Cypress assertions: https://docs.cypress.io/guides/references/assertions.html#Chai
- Cypress testing library: https://testing-library.com/docs/cypress-testing-library/intro
- Mock Service Worker docs: https://mswjs.io/docs/
- Useful article about testing with MSW: https://kentcdodds.com/blog/stop-mocking-fetch
- Tailwind CSS - https://tailwindcss.com
- Tailwind CSS Custom Forms - https://tailwindcss-custom-forms.netlify.app/
- Icon Set: https://heroicons.com/
- XState (state machine library): https://xstate.js.org/docs/
- React Framer Motion (animation components): https://www.framer.com/api/motion/
- Fishery (for defining factories): https://github.com/thoughtbot/fishery

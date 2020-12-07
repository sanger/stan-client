# Stan (Client)

![CI](https://github.com/sanger/stan-client/workflows/Test/badge.svg)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Dependencies

- `Node v14.11`
- `Yarn v1.22`

## Getting Started

To install the dependencies for the project, you can run:

### `yarn`

In order for `graphql-codegen` to generate TypeScript types to match the GraphQL schema, create a `.env.local` file in the root of the project and include the property `GRAPHQL_SCHEMA_LOCATION`:

    // .env.local
    GRAPHQL_SCHEMA_LOCATION=/path/to/schema.graphqls

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn start:msw`

Runs the app in the development mode with MockServiceWorker enabled (see below).<br />
Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### `yarn codegen`

Runs the [GraphQL Code Generator](https://graphql-code-generator.com/docs/getting-started/index). This command automatically runs before `yarn start`, `yarn start:msw`, and `yarn test:open`. 

GraphQL Code Generator is a CLI tool that can generate TypeScript typings out of a GraphQL schema.

Its configuration lives in `codegen.yml`. Its output goes into the `/types` directory.

### `yarn codegen:machine <name>`

Runs a code generator ([hydra](http://www.hygen.io/docs/quick-start)) to generate an XState state machine with name as the CLI argument `<name>`. Generator template is in `_templates/machine/new`. 

### `yarn test:open`

Starts the app on [http://localhost:3001](http://localhost:3001) with `REACT_APP_MOCK_API=msw` then launches the [Cypress](https://www.cypress.io/) test runner.

When the environment variable `REACT_APP_MOCK_API` is set to `msw`, after the application loads up it will also start [Mock Service Worker](https://mswjs.io/docs/). This allows all requests to the API to be mocked at the network level. The message `[MSW] Mocking enabled.` will be shown in the browser's javascript console.

By default, when using `cy.visit()` to visit a page in `cypress`, the user is already logged in. To visit as a guest, use `cy.visitAsGuest()` method.

The default handlers for `msw` are in `/src/mocks/handlers.ts`. There is a hook on the `window` object called `postMSWStart` that allows you to add more handlers before React starts. Look in `cypress/support/commands.ts` to see how this is utilized.

If using IntelliJ, install the [Cypress](https://plugins.jetbrains.com/plugin/13819-cypress-support) plugin to allow running tests inside the IDE.

### `yarn test`

Does the same as `yarn test:open` but runs all `cypress` tests on the command line, instead of using its launcher.

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

- Apollo Client (client for calling GraphQL): https://www.apollographql.com/docs/react/
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
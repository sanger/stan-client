import React from 'react';
import ReactDOM from 'react-dom';
import { enableAllPlugins } from 'immer';
import './styles/index.css';
import App from './App';

// To use the XState Inspector, uncomment the following lines
// import { inspect } from "@xstate/inspect";
// inspect({
//   iframe: false,
// });

/**
 * Enable all immer plugins
 * {@link https://immerjs.github.io/immer/docs/installation}
 */
enableAllPlugins();

/**
 * Setup MockServiceWorker if `REACT_APP_MOCK_API` is set to `msw`
 * Call the `postMSWStart` if there is one defined
 * @see cypress/support/commands.ts
 */
async function prepare() {
  if (process.env.REACT_APP_MOCK_API === 'msw') {
    const { worker } = require('./mocks/mswSetup');
    await worker.start();
  }
}

prepare().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
    () => window.dispatchEvent(new CustomEvent('reactRenderComplete'))
  );
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

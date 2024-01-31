import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { stanCore, StanCoreContext } from './lib/sdk';
import { ConfigProvider } from './context/ConfigContext';
import RouteLayout from './components/RouteLayout';

function App() {
  React.useEffect(() => {
    /**This is important for cypress tests to run.
     *Cypress is waiting for this event to happen in onBeforeLoad callback in cypress/support/command.ts*/
    window.dispatchEvent(new CustomEvent('reactRenderComplete'));
  }, []);
  return (
    <ConfigProvider>
      <StanCoreContext.Provider value={stanCore}>
        <AuthProvider>
          <RouteLayout />
        </AuthProvider>
      </StanCoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;

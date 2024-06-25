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

  /**
   * This disables the default scroll wheel behavior on all number input fields.
   * This effect applies globally to all number input fields in the document.
   */
  React.useEffect(() => {
    const handleWheel = (event: MouseEvent) => {
      if (document.activeElement && document.activeElement.getAttribute('type') === 'number') {
        event.preventDefault();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
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

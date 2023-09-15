import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { stanCore, StanCoreContext } from './lib/sdk';
import { ConfigProvider } from './context/ConfigContext';
import RouteLayout from './components/RouteLayout';

function App() {
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

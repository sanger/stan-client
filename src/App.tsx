import React from 'react';
import { Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RouteManager } from './components/RouteManager';
import { stanCore, StanCoreContext } from './lib/sdk';
import { ConfigProvider } from './context/ConfigContext';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <ConfigProvider>
      <StanCoreContext.Provider value={stanCore}>
        <BrowserRouter>
          <AuthProvider>
            <RouteManager />
          </AuthProvider>
        </BrowserRouter>
      </StanCoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;

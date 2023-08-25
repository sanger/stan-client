import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Router, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RouteManager } from './components/RouteManager';
import { stanCore, StanCoreContext } from './lib/sdk';
import { ConfigProvider } from './context/ConfigContext';
import { BrowserRouter } from 'react-router-dom';
import DataFetcher from './components/DataFetcher';
import WorkProgress from './pages/WorkProgress';
import Store from './pages/Store';
import routes from './components/RouteLayout';
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

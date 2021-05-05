import React from "react";
import { Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Routes } from "./components/Routes";
import { history, stanCore, StanCoreContext } from "./lib/sdk";
import { ConfigProvider } from "./context/ConfigContext";

function App() {
  return (
    <ConfigProvider>
      <StanCoreContext.Provider value={stanCore}>
        <Router history={history}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </Router>
      </StanCoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;

import React from "react";
import { stanCore, StanCoreContext } from "./lib/sdk";
import { ConfigProvider } from "./context/ConfigContext";
import { Router } from "./components/Router";

function App() {
  return (
    <ConfigProvider>
      <StanCoreContext.Provider value={stanCore}>
        <Router />
      </StanCoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;

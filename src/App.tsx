import React from "react";
import { Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Routes } from "./components/Routes";
import { ApolloProvider } from "@apollo/client";
import client, { history } from "./lib/client";
import { stanCore, StanCoreContext } from "./lib/sdk";

function App() {
  return (
    <ApolloProvider client={client}>
      <StanCoreContext.Provider value={stanCore}>
        <Router history={history}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </Router>
      </StanCoreContext.Provider>
    </ApolloProvider>
  );
}

export default App;

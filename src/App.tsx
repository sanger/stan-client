import React from "react";
import { Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Routes } from "./components/Routes";
import { ApolloProvider } from "@apollo/client";
import client, { history } from "./lib/client";

function App() {
  return (
    <ApolloProvider client={client}>
      <Router history={history}>
        <AuthProvider>
          <Routes />
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;

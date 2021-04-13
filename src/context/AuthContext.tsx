import React, { createContext, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useMinimumWait } from "../lib/hooks";
import Splash from "../pages/Splash";
import {
  useCurrentUserLazyQuery,
  useLogoutMutation,
  UserFieldsFragment,
} from "../types/graphql";

/**
 * Includes other properties the application is interested in for authentication
 */
interface AuthState {
  user: UserFieldsFragment;
}

interface AuthContext {
  authState: AuthState | null;
  setAuthState: (authState: AuthState) => void;
  clearAuthState: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Default context for before we know whether or not a user is authenticated.
 */
const initialContext: AuthContext = {
  isAuthenticated: () => false,
  setAuthState: () => {},
  clearAuthState: () => {},
  logout: () => {},
  authState: null,
};

const authContext = createContext<AuthContext>(initialContext);
const { Provider } = authContext;

interface AuthProviderProps {
  children: JSX.Element | JSX.Element[];
}

const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const minimumWait = process.env.NODE_ENV === "production" ? 1500 : 0;
  const waitElapsed = useMinimumWait(minimumWait);
  // Set the current auth state. null if user is not logged in.
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [currentUser, { data }] = useCurrentUserLazyQuery();
  const [logoutMutation] = useLogoutMutation();
  const client = useApolloClient();

  useEffect(() => {
    try {
      currentUser();
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    if (data?.user) {
      setAuthState({
        user: data.user,
      });
    } else {
      setAuthState(null);
    }
  }, [data]);

  /**
   * Sets the AuthState
   * @param userInfo
   */
  const setAuthInfo = ({ user }: AuthState) => {
    setAuthState({ user });
  };

  /**
   * Returns whether the current user is authenticated
   * @return boolean
   */
  const isAuthenticated = () => {
    return authState != null;
  };

  /**
   * Logs the user out and resets authState
   */
  const logout = async () => {
    try {
      await logoutMutation();
      await client.clearStore();
      clearAuthState();
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Reset the AuthState
   */
  const clearAuthState = () => {
    setAuthState(null);
  };

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authState: AuthState) => setAuthInfo(authState),
        clearAuthState,
        isAuthenticated,
        logout,
      }}
    >
      {!waitElapsed ? <Splash /> : children}
    </Provider>
  );
};

export { authContext, AuthProvider };

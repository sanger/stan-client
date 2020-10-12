import React, { createContext, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useMinimumWait } from "../hooks";
import Loading from "../pages/Loading";
import { useCurrentUserLazyQuery, useLogoutMutation } from "../types/graphql";

/**
 * This will probably end up being an interface generated from a GraphQL type
 */
interface UserInfo {
  username: string;
}

/**
 * Includes other properties the application is interested in for authentication
 */
interface AuthState {
  userInfo: UserInfo;
}

interface AuthContext {
  authState: AuthState | null;
  setAuthState: (authState: AuthState) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Default context for before we know whether or not a user is authenticated.
 */
const initialContext: AuthContext = {
  isAuthenticated: () => false,
  setAuthState: () => {},
  logout: () => {},
  authState: null,
};

const AuthContext = createContext<AuthContext>(initialContext);
const { Provider } = AuthContext;

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
        userInfo: {
          username: data.user.username,
        },
      });
    } else {
      setAuthState(null);
    }
  }, [data]);

  /**
   * Sets the AuthState
   * @param userInfo
   */
  const setAuthInfo = ({ userInfo }: AuthState) => {
    setAuthState({ userInfo });
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
      setAuthState(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authState: AuthState) => setAuthInfo(authState),
        isAuthenticated,
        logout,
      }}
    >
      {!waitElapsed ? <Loading /> : children}
    </Provider>
  );
};

export { AuthContext, AuthProvider };

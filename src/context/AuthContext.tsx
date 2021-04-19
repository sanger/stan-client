import React, { createContext, useCallback, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useMinimumWait } from "../lib/hooks";
import Splash from "../pages/Splash";
import {
  useCurrentUserQuery,
  useLogoutMutation,
  UserFieldsFragment,
} from "../types/graphql";
import { UserRole } from "../types/sdk";

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
  userRoleIncludes: (role: UserRole) => boolean;
}

/**
 * Default context for before we know whether or not a user is authenticated.
 */
const initialContext: AuthContext = {
  isAuthenticated: () => false,
  userRoleIncludes: () => false,
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
  // We don't want to render children until the `currentUser` query has completed and
  // authState has been set
  const [isLoading, setIsLoading] = useState(true);
  useCurrentUserQuery({
    onCompleted: (data) => {
      if (data?.user) {
        setAuthState({
          user: data.user,
        });
      } else {
        setAuthState(null);
      }
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });
  const [logoutMutation] = useLogoutMutation();
  const client = useApolloClient();
  const userRoles = Object.values(UserRole);

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

  /**
   * Check if the current authenticated user has the given role
   */
  const userRoleIncludes = useCallback(
    (role: UserRole): boolean => {
      if (!authState?.user) {
        return false;
      }
      return userRoles.indexOf(authState.user.role) >= userRoles.indexOf(role);
    },
    [authState, userRoles]
  );

  return (
    <Provider
      value={{
        authState,
        setAuthState: (authState: AuthState) => setAuthInfo(authState),
        clearAuthState,
        isAuthenticated,
        userRoleIncludes,
        logout,
      }}
    >
      {!waitElapsed || isLoading ? <Splash /> : children}
    </Provider>
  );
};

export { authContext, AuthProvider };

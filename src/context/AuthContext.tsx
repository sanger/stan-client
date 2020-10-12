import React, { createContext, useState } from "react";

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
  expiresAt: number;
}

interface AuthContext {
  authState: AuthState | null;
  setAuthState: (authState: AuthState) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const USER_INFO_KEY = "userInfo";
const EXPIRES_AT = "expiresAt";

// Check in local storage for previous auth state
const userInfo = localStorage.getItem(USER_INFO_KEY);
const expiresAt = localStorage.getItem(EXPIRES_AT);

let initialAuthState: AuthState | null = null;

if (userInfo && expiresAt) {
  initialAuthState = {
    userInfo: JSON.parse(userInfo),
    expiresAt: parseInt(expiresAt),
  };
}

/**
 * Default context for before we know whether or not a user is authenticated.
 */
const guestContext: AuthContext = {
  isAuthenticated: () => false,
  setAuthState: () => {},
  logout: () => {},
  authState: null,
};

const AuthContext = createContext<AuthContext>(guestContext);
const { Provider } = AuthContext;

interface AuthProviderProps {
  children: JSX.Element | JSX.Element[];
}

const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  // Set the current auth state. null if user is not logged in.
  const [authState, setAuthState] = useState<AuthState | null>(
    initialAuthState
  );

  /**
   * Sets the AuthState as well as persisting it to local storage
   * @param userInfo
   * @param expiresAt
   */
  const setAuthInfo = ({ userInfo, expiresAt }: AuthState) => {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    localStorage.setItem(EXPIRES_AT, expiresAt.toString());
    setAuthState({ userInfo, expiresAt });
  };

  /**
   * Returns whether the current user is authenticated
   * @return boolean
   */
  const isAuthenticated = () => {
    if (!authState?.expiresAt) {
      return false;
    }
    return new Date() < new Date(authState.expiresAt);
  };

  /**
   * Logs the user out by setting the AuthState to null and removing it from local storage
   */
  const logout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(EXPIRES_AT);
    setAuthState(null);
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
      {children}
    </Provider>
  );
};

export { AuthContext, AuthProvider };

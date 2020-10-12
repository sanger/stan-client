import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loading from "./Loading";

/**
 * Logs out the current user and redirects them to the login page.
 */
const Logout = () => {
  const authContext = useContext(AuthContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const logout = async () => {
      await authContext.logout();
      setTimeout(() => {
        setShouldRedirect(true);
      }, 1200);
    };

    if (authContext.isAuthenticated()) {
      logout();
    }
  }, []);

  return shouldRedirect ? (
    <Redirect
      to={{ pathname: "/login", state: { success: "Logout successful" } }}
    />
  ) : (
    <Loading />
  );
};

export default Logout;

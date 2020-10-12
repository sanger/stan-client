import React, { useContext, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Logs out the current user and redirects them to the login page.
 */
const Logout = () => {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    authContext.logout();
  }, [authContext]);

  return (
    <Redirect
      to={{ pathname: "/login", state: { success: "Logout successful" } }}
    />
  );
};

export default Logout;

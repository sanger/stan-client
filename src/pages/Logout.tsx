import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Splash from './Splash';
import { Navigate } from 'react-router-dom';

/**
 * Logs out the current user and redirects them to the login page.
 */
const Logout = () => {
  const auth = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const logout = async () => {
      await auth.logout();
      setTimeout(() => {
        setShouldRedirect(true);
      }, 1200);
    };

    if (auth.isAuthenticated()) {
      logout();
    }
  }, [auth]);

  return shouldRedirect ? <Navigate to="/login" replace state={{ message: 'Logout successful' }} /> : <Splash />;
};

export default Logout;

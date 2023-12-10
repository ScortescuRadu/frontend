import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, path }) => {
  const isLoggedIn = !!localStorage.getItem('access_token');

  return isLoggedIn ? (
    <Route path={path} element={element} />
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;

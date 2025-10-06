import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return (props: P) => {
    const { token } = useAuth();
    // const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Component {...props} />;
  };
};

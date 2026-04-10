import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

import { useAuth } from '../../context/AuthContext.jsx';

function RoleRoute({ allowedRole }) {
  const location = useLocation();
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3 mb-0">Checking permissions...</p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
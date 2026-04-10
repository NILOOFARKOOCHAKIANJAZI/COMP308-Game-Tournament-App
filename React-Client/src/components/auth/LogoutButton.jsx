import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

function LogoutButton({ variant = 'outline-light', size = 'sm' }) {
  const navigate = useNavigate();
  const { logoutCurrentUser, logoutLoading } = useAuth();

  const handleLogout = async () => {
    const result = await logoutCurrentUser();

    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={logoutLoading}
    >
      {logoutLoading ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </Button>
  );
}

export default LogoutButton;
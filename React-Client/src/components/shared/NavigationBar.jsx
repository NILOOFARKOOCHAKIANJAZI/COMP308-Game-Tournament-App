import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';

import { useAuth } from '../../context/AuthContext.jsx';
import LogoutButton from "../auth/LogoutButton.jsx";

function NavigationBar() {
  const { user, role, isAuthenticated, loading } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Gaming Tournaments Portal
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {!loading && !isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}

            {!loading && isAuthenticated && role === 'Admin' && (
              <>
                <Nav.Link as={Link} to="/admin">
                  Admin Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/create-user">
                  Create User
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/create-tournament">
                  Create Tournament
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/assign-player">
                  Assign Player
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/players">
                  Players
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/tournaments">
                  Tournaments
                </Nav.Link>
              </>
            )}

            {!loading && isAuthenticated && role === 'Player' && (
              <>
                <Nav.Link as={Link} to="/player">
                  Player Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/player/upcoming-tournaments">
                  Upcoming Tournaments
                </Nav.Link>
                <Nav.Link as={Link} to="/player/history">
                  Tournament History
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {loading ? (
              <span className="text-light small d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                Loading...
              </span>
            ) : isAuthenticated ? (
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="text-light small">
                  Signed in as <strong>{user?.username}</strong> ({role})
                </span>
                <LogoutButton />
              </div>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
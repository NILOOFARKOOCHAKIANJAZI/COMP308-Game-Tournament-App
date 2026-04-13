//import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import React, { lazy, Suspense } from 'react';

const ThreeScene = lazy(() => import('./ThreeScene.jsx'));

import { useAuth } from '../../context/AuthContext.jsx';

function Home() {
  const { isAuthenticated, role, user, loading } = useAuth();

  const getDashboardLink = () => {
    if (role === 'Admin') {
      return '/admin';
    }

    if (role === 'Player') {
      return '/player';
    }

    return '/dashboard';
  };

  return (
    <Container className="py-5">
      <Row className="align-items-center justify-content-center g-4">
        <Col lg={7}>
          <div className="pe-lg-4 text-center text-lg-start">
            <h1 className="display-5 fw-bold mb-3">
              Gaming Tournaments and Players Portal
            </h1>

            
          
            <p className="lead text-muted mb-4">
              Manage tournaments, create users, assign players, and track
              player tournament history through a modern React and GraphQL
              application.
            </p>

            {loading ? (
              <p className="text-muted">Loading your session...</p>
            ) : isAuthenticated ? (
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                <Button as={Link} to={getDashboardLink()} variant="dark">
                  Go to Dashboard
                </Button>

                {role === 'Player' && (
                  <Button
                    as={Link}
                    to="/player/upcoming-tournaments"
                    variant="outline-dark"
                  >
                    View Upcoming Tournaments
                  </Button>
                )}

                {role === 'Admin' && (
                  <Button
                    as={Link}
                    to="/admin/create-tournament"
                    variant="outline-dark"
                  >
                    Create Tournament
                  </Button>
                )}
              </div>
            ) : (
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                <Button as={Link} to="/register" variant="dark">
                  Get Started
                </Button>

                <Button as={Link} to="/login" variant="outline-dark">
                  Login
                </Button>
              </div>
            )}

            {!loading && isAuthenticated && (
              <p className="mt-4 mb-0 text-muted">
                Signed in as <strong>{user?.username}</strong> ({role})
              </p>
            )}
          </div>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="p-4">
              <h3 className="mb-3">Platform Features</h3>

              <ul className="mb-0 ps-3">
                <li className="mb-2">
                  Secure register and login with role-based access
                </li>
                <li className="mb-2">
                  Admin tools for creating users and tournaments
                </li>
                <li className="mb-2">
                  Player tools for joining tournaments and viewing history
                </li>
                <li className="mb-2">
                  Responsive UI built with React-Bootstrap
                </li>
                <li className="mb-2">
                  GraphQL API integration using Apollo Client
                </li>
                <li>
                  Clean separation between admin and player portals
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;
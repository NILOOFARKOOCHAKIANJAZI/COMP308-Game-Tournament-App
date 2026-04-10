import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';

import { useAuth } from '../../context/AuthContext.jsx';
import { GET_PLAYERS, GET_TOURNAMENTS, GET_USERS } from '../../graphql/queries.js';

function AdminDashboard() {
  const { user } = useAuth();

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError
  } = useQuery(GET_USERS);

  const {
    data: playersData,
    loading: playersLoading,
    error: playersError
  } = useQuery(GET_PLAYERS);

  const {
    data: tournamentsData,
    loading: tournamentsLoading,
    error: tournamentsError
  } = useQuery(GET_TOURNAMENTS);

  const users = usersData?.users ?? [];
  const players = playersData?.players ?? [];
  const tournaments = tournamentsData?.tournaments ?? [];

  const upcomingCount = tournaments.filter(
    (tournament) => tournament.status === 'Upcoming'
  ).length;

  const ongoingCount = tournaments.filter(
    (tournament) => tournament.status === 'Ongoing'
  ).length;

  const completedCount = tournaments.filter(
    (tournament) => tournament.status === 'Completed'
  ).length;

  const isLoading = usersLoading || playersLoading || tournamentsLoading;
  const hasError = usersError || playersError || tournamentsError;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="mb-2" id="adminDashboardHeading">
          Admin Dashboard
        </h2>
        <p className="text-muted mb-0" id="adminDashboardDescription">
          Welcome back{user?.username ? `, ${user.username}` : ''}. Manage users,
          tournaments, and player assignments from this dashboard.
        </p>
      </div>

      {hasError && (
        <Alert variant="danger" role="alert" aria-live="assertive">
          {usersError?.message ||
            playersError?.message ||
            tournamentsError?.message ||
            'Failed to load dashboard data.'}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" aria-hidden="true" />
          <p className="mt-3 mb-0">Loading admin dashboard...</p>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4" aria-label="Admin summary cards">
            <Col md={6} xl={3}>
              <Card className="h-100 shadow-sm border-0" aria-label={`Total users: ${users.length}`}>
                <Card.Body>
                  <Card.Title>Total Users</Card.Title>
                  <h3 className="fw-bold mb-1">{users.length}</h3>
                  <p className="text-muted mb-0">
                    All registered platform accounts.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`Total players: ${players.length}`}
              >
                <Card.Body>
                  <Card.Title>Total Players</Card.Title>
                  <h3 className="fw-bold mb-1">{players.length}</h3>
                  <p className="text-muted mb-0">
                    Player profiles available for tournaments.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`Total tournaments: ${tournaments.length}`}
              >
                <Card.Body>
                  <Card.Title>Total Tournaments</Card.Title>
                  <h3 className="fw-bold mb-1">{tournaments.length}</h3>
                  <p className="text-muted mb-0">
                    All tournaments in the system.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={3}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`Upcoming tournaments: ${upcomingCount}`}
              >
                <Card.Body>
                  <Card.Title>Upcoming</Card.Title>
                  <h3 className="fw-bold mb-1">{upcomingCount}</h3>
                  <p className="text-muted mb-0">
                    Upcoming tournaments ready for registration.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="adminQuickActionsHeading"
                aria-describedby="adminQuickActionsDescription"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <div>
                      <h4 className="mb-1" id="adminQuickActionsHeading">
                        Quick Actions
                      </h4>
                      <p className="text-muted mb-0" id="adminQuickActionsDescription">
                        Use these shortcuts to manage the platform.
                      </p>
                    </div>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>Create User</h5>
                          <p className="text-muted">
                            Add a new Admin or Player account to the platform.
                          </p>
                          <Button as={Link} to="/admin/create-user" variant="dark">
                            Go to Create User
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>Create Tournament</h5>
                          <p className="text-muted">
                            Add a new gaming tournament with date and status.
                          </p>
                          <Button
                            as={Link}
                            to="/admin/create-tournament"
                            variant="dark"
                          >
                            Go to Create Tournament
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>Assign Players</h5>
                          <p className="text-muted">
                            Assign players to upcoming tournaments.
                          </p>
                          <Button
                            as={Link}
                            to="/admin/assign-player"
                            variant="outline-dark"
                          >
                            Assign Player
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>Review Lists</h5>
                          <p className="text-muted">
                            View current players and tournaments in the system.
                          </p>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button
                              as={Link}
                              to="/admin/players"
                              variant="outline-dark"
                            >
                              Players
                            </Button>
                            <Button
                              as={Link}
                              to="/admin/tournaments"
                              variant="outline-dark"
                            >
                              Tournaments
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="tournamentStatusSummaryHeading"
              >
                <Card.Body>
                  <h4 className="mb-3" id="tournamentStatusSummaryHeading">
                    Tournament Status Summary
                  </h4>
                  <ListGroup variant="flush" aria-label="Tournament status counts">
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Upcoming</span>
                      <strong>{upcomingCount}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Ongoing</span>
                      <strong>{ongoingCount}</strong>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between px-0">
                      <span>Completed</span>
                      <strong>{completedCount}</strong>
                    </ListGroup.Item>
                  </ListGroup>

                  <hr />

                  <h5 className="mb-3">Admin Notes</h5>
                  <p className="text-muted mb-0">
                    Make sure players are assigned only to valid tournaments.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="recentUsersHeading"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" id="recentUsersHeading">
                      Recent Users
                    </h4>
                    <Button
                      as={Link}
                      to="/admin/players"
                      variant="outline-secondary"
                      size="sm"
                    >
                      View More
                    </Button>
                  </div>

                  {users.length === 0 ? (
                    <p className="text-muted mb-0" role="status" aria-live="polite">
                      No users found.
                    </p>
                  ) : (
                    <ListGroup variant="flush" aria-label="Recent users list">
                      {users.slice(0, 5).map((item) => (
                        <ListGroup.Item
                          key={item.id}
                          className="px-0 d-flex justify-content-between align-items-start"
                        >
                          <div>
                            <div className="fw-semibold">{item.username}</div>
                            <div className="text-muted small">{item.email}</div>
                          </div>
                          <span className="small fw-semibold">{item.role}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="recentTournamentsHeading"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" id="recentTournamentsHeading">
                      Recent Tournaments
                    </h4>
                    <Button
                      as={Link}
                      to="/admin/tournaments"
                      variant="outline-secondary"
                      size="sm"
                    >
                      View More
                    </Button>
                  </div>

                  {tournaments.length === 0 ? (
                    <p className="text-muted mb-0" role="status" aria-live="polite">
                      No tournaments found.
                    </p>
                  ) : (
                    <ListGroup variant="flush" aria-label="Recent tournaments list">
                      {tournaments.slice(0, 5).map((item) => (
                        <ListGroup.Item
                          key={item.id}
                          className="px-0 d-flex justify-content-between align-items-start"
                        >
                          <div>
                            <div className="fw-semibold">{item.name}</div>
                            <div className="text-muted small">{item.game}</div>
                          </div>
                          <span className="small fw-semibold">{item.status}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default AdminDashboard;
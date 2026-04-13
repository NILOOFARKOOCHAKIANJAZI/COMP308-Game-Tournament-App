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
import ThreeScene from '../../components/shared/ThreeScene.jsx';
import {
  GET_ME,
  GET_MY_TOURNAMENT_HISTORY,
  GET_UPCOMING_TOURNAMENTS
} from '../../graphql/queries.js';

function PlayerDashboard() {
  const { user } = useAuth();

  const {
    data: meData,
    loading: meLoading,
    error: meError
  } = useQuery(GET_ME);

  const {
    data: upcomingData,
    loading: upcomingLoading,
    error: upcomingError
  } = useQuery(GET_UPCOMING_TOURNAMENTS);

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError
  } = useQuery(GET_MY_TOURNAMENT_HISTORY);

  const me = meData?.me ?? user ?? null;
  const upcomingTournaments = upcomingData?.upcomingTournaments ?? [];
  const tournamentHistory = historyData?.myTournamentHistory ?? [];

const upcomingCount = upcomingTournaments.length;
const historyCount = tournamentHistory.length;
const completedCount = tournamentHistory.filter(
  (tournament) => tournament.status === 'Completed'
).length;

const joinedTournamentIds = new Set(tournamentHistory.map((tournament) => tournament.id));

const availableUpcomingCount = upcomingTournaments.filter(
  (tournament) => !joinedTournamentIds.has(tournament.id)
).length;

let cubeStatus = 'inactive';

if (availableUpcomingCount > 0) {
  cubeStatus = 'upcoming';
} else if (historyCount > 0) {
  cubeStatus = 'joined';
}

  const isLoading = meLoading || upcomingLoading || historyLoading;
  const hasError = meError || upcomingError || historyError;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="mb-2" id="playerDashboardHeading">
          Player Dashboard
        </h2>
        <p className="text-muted mb-0" id="playerDashboardDescription">
          Welcome back{me?.username ? `, ${me.username}` : ''}. Explore tournaments,
          join upcoming events, and track your tournament history.
        </p>
      </div>

      {hasError && (
        <Alert variant="danger" role="alert" aria-live="assertive">
          {meError?.message ||
            upcomingError?.message ||
            historyError?.message ||
            'Failed to load player dashboard data.'}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" aria-hidden="true" />
          <p className="mt-3 mb-0">Loading player dashboard...</p>
        </div>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="tournamentStatusCubeHeading"
                aria-describedby="tournamentStatusCubeDescription tournamentStatusCubeLegend"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="mb-1" id="tournamentStatusCubeHeading">
                        Tournament Status Cube
                      </h4>
                      <p className="text-muted mb-0" id="tournamentStatusCubeDescription">
                        A live 3D indicator of your current tournament activity.
                      </p>
                    </div>
                  </div>

                  <ThreeScene status={cubeStatus} />

                  <div className="mt-3" id="tournamentStatusCubeLegend">
                    <p className="mb-2">
                      <strong>How it works:</strong>
                    </p>
                    <ul className="text-muted ps-3 mb-0">
                      <li>Green = upcoming tournaments available</li>
                      <li>Yellow = joined tournaments in history</li>
                      <li>Red = no tournament activity yet</li>
                    </ul>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="activitySummaryHeading"
              >
                <Card.Body>
                  <h4 className="mb-3" id="activitySummaryHeading">
                    Activity Summary
                  </h4>
                  <p className="text-muted mb-2">
                    Username: <strong>{me?.username || 'N/A'}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Email: <strong>{me?.email || 'N/A'}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Upcoming Tournaments: <strong>{upcomingCount}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Tournament History: <strong>{historyCount}</strong>
                  </p>
                  <p className="text-muted mb-0">
                    Completed Tournaments: <strong>{completedCount}</strong>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4" aria-label="Player summary cards">
            <Col md={6} xl={4}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`My role: ${me?.role || 'Player'}`}
              >
                <Card.Body>
                  <Card.Title>My Role</Card.Title>
                  <h3 className="fw-bold mb-1">{me?.role || 'Player'}</h3>
                  <p className="text-muted mb-0">
                    Logged-in account role for this portal.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={4}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`Upcoming tournaments: ${upcomingCount}`}
              >
                <Card.Body>
                  <Card.Title>Upcoming Tournaments</Card.Title>
                  <h3 className="fw-bold mb-1">{upcomingCount}</h3>
                  <p className="text-muted mb-0">
                    Tournaments available to explore and join.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} xl={4}>
              <Card
                className="h-100 shadow-sm border-0"
                aria-label={`My tournament history count: ${historyCount}`}
              >
                <Card.Body>
                  <Card.Title>My Tournament History</Card.Title>
                  <h3 className="fw-bold mb-1">{historyCount}</h3>
                  <p className="text-muted mb-0">
                    Events currently recorded in your history.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg={8}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="playerQuickActionsHeading"
              >
                <Card.Body>
                  <h4 className="mb-3" id="playerQuickActionsHeading">
                    Quick Actions
                  </h4>

                  <Row className="g-3">
                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>View Upcoming Tournaments</h5>
                          <p className="text-muted">
                            Browse tournaments that are open for player participation.
                          </p>
                          <Button
                            as={Link}
                            to="/player/upcoming-tournaments"
                            variant="dark"
                          >
                            View Upcoming
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h5>View Tournament History</h5>
                          <p className="text-muted">
                            Review the tournaments already associated with your account.
                          </p>
                          <Button
                            as={Link}
                            to="/player/history"
                            variant="outline-dark"
                          >
                            View History
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h5 className="mb-3">Player Summary</h5>
                  <p className="text-muted mb-2">
                    Username: <strong>{me?.username || 'N/A'}</strong>
                  </p>
                  <p className="text-muted mb-2">
                    Email: <strong>{me?.email || 'N/A'}</strong>
                  </p>
                  <p className="text-muted mb-0">
                    Completed Tournaments: <strong>{completedCount}</strong>
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="playerNotesHeading"
              >
                <Card.Body>
                  <h4 className="mb-3" id="playerNotesHeading">
                    Player Notes
                  </h4>
                  <p className="text-muted">
                    You can only join tournaments that are marked as{' '}
                    <strong>Upcoming</strong>.
                  </p>
                  <p className="text-muted">
                    Use the upcoming tournaments page to join events and the history
                    page to review your participation.
                  </p>
                  <p className="text-muted mb-0">
                    Enjoy!
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="upcomingTournamentsHeading"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" id="upcomingTournamentsHeading">
                      Upcoming Tournaments
                    </h4>
                    <Button
                      as={Link}
                      to="/player/upcoming-tournaments"
                      variant="outline-secondary"
                      size="sm"
                    >
                      View More
                    </Button>
                  </div>

                  {upcomingTournaments.length === 0 ? (
                    <p className="text-muted mb-0" role="status" aria-live="polite">
                      No upcoming tournaments available.
                    </p>
                  ) : (
                    <ListGroup variant="flush" aria-label="Upcoming tournaments list">
                      {upcomingTournaments.slice(0, 5).map((item) => (
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

            <Col lg={6}>
              <Card
                className="shadow-sm border-0 h-100"
                aria-labelledby="myTournamentHistoryHeading"
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0" id="myTournamentHistoryHeading">
                      My Tournament History
                    </h4>
                    <Button
                      as={Link}
                      to="/player/history"
                      variant="outline-secondary"
                      size="sm"
                    >
                      View More
                    </Button>
                  </div>

                  {tournamentHistory.length === 0 ? (
                    <p className="text-muted mb-0" role="status" aria-live="polite">
                      Your tournament history is empty.
                    </p>
                  ) : (
                    <ListGroup variant="flush" aria-label="Tournament history list">
                      {tournamentHistory.slice(0, 5).map((item) => (
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

export default PlayerDashboard;
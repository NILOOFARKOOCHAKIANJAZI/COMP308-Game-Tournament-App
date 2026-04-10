import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

import { GET_MY_TOURNAMENT_HISTORY, GET_UPCOMING_TOURNAMENTS } from '../../graphql/queries.js';
import JoinTournamentButton from './JoinTournamentButton.jsx';

function UpcomingTournaments() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: upcomingData,
    loading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming
  } = useQuery(GET_UPCOMING_TOURNAMENTS, {
    fetchPolicy: 'network-only'
  });

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery(GET_MY_TOURNAMENT_HISTORY, {
    fetchPolicy: 'network-only'
  });

  const upcomingTournaments = upcomingData?.upcomingTournaments ?? [];
  const myTournamentHistory = historyData?.myTournamentHistory ?? [];

  const joinedTournamentIds = new Set(myTournamentHistory.map((item) => item.id));

  const filteredTournaments = useMemo(() => {
    if (!searchTerm.trim()) {
      return upcomingTournaments;
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return upcomingTournaments.filter((tournament) => {
      return (
        tournament.name.toLowerCase().includes(normalizedSearch) ||
        tournament.game.toLowerCase().includes(normalizedSearch) ||
        tournament.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchTerm, upcomingTournaments]);

  const handleJoined = async () => {
    await refetchUpcoming();
    await refetchHistory();
  };

  if (upcomingLoading || historyLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" aria-hidden="true" />
          <p className="mt-3 mb-0">Loading upcoming tournaments...</p>
        </div>
      </Container>
    );
  }

  if (upcomingError || historyError) {
    return (
      <Container className="py-4">
        <Alert variant="danger" role="alert" aria-live="assertive">
          {upcomingError?.message ||
            historyError?.message ||
            'Failed to load upcoming tournaments.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="mb-2" id="upcomingTournamentsPageHeading">
          Upcoming Tournaments
        </h2>
        <p className="text-muted mb-0" id="upcomingTournamentsPageDescription">
          Browse available tournaments and join the ones that interest you.
        </p>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={8}>
              <Form.Group controlId="searchUpcomingTournaments">
                <Form.Label>Search Tournaments</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by tournament name, game, or status"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-describedby="searchUpcomingTournamentsHelp"
                />
                <Form.Text id="searchUpcomingTournamentsHelp" muted>
                  Filter the tournament list by name, game, or status.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={4}>
              <div className="text-md-end">
                <Badge
                  bg="dark"
                  pill
                  aria-label={`${filteredTournaments.length} tournaments available`}
                >
                  {filteredTournaments.length} Available
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredTournaments.length === 0 ? (
        <Alert variant="secondary" role="status" aria-live="polite">
          No upcoming tournaments match your search.
        </Alert>
      ) : (
        <Row
          className="g-4"
          aria-labelledby="upcomingTournamentsPageHeading"
          aria-describedby="upcomingTournamentsPageDescription"
        >
          {filteredTournaments.map((tournament) => {
            const alreadyJoined = joinedTournamentIds.has(tournament.id);

            return (
              <Col lg={6} key={tournament.id}>
                <Card
                  className="h-100 shadow-sm border-0"
                  aria-label={`Tournament ${tournament.name}`}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <h4 className="mb-1">{tournament.name}</h4>
                        <p className="text-muted mb-0">{tournament.game}</p>
                      </div>
                      <Badge
                        bg="primary"
                        aria-label={`Tournament status: ${tournament.status}`}
                      >
                        {tournament.status}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="mb-2">
                        <strong>Date:</strong>{' '}
                        <time dateTime={new Date(tournament.date).toISOString()}>
                          {new Date(tournament.date).toLocaleString()}
                        </time>
                      </p>
                      <p className="mb-2">
                        <strong>Players Joined:</strong>{' '}
                        {tournament.players?.length || 0}
                      </p>
                    </div>

                    {tournament.players?.length > 0 && (
                      <div className="mb-3">
                        <strong className="d-block mb-2">Current Players</strong>
                        <div className="text-muted small">
                          {tournament.players
                            .map((player) => player.user?.username || 'Unknown Player')
                            .join(', ')}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      {alreadyJoined ? (
                        <Alert
                          variant="success"
                          className="mb-0"
                          role="status"
                          aria-live="polite"
                        >
                          You already joined this tournament.
                        </Alert>
                      ) : (
                        <JoinTournamentButton
                          tournamentId={tournament.id}
                          onJoined={handleJoined}
                        />
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default UpcomingTournaments;
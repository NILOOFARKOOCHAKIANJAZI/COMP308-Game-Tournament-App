import React from 'react';
import { useQuery } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import { GET_MY_TOURNAMENT_HISTORY } from '../../graphql/queries.js';

function TournamentHistory() {
  const { data, loading, error } = useQuery(GET_MY_TOURNAMENT_HISTORY, {
    fetchPolicy: 'network-only'
  });

  const tournamentHistory = data?.myTournamentHistory ?? [];

  const getStatusBadge = (status) => {
    if (status === 'Upcoming') return 'primary';
    if (status === 'Ongoing') return 'warning';
    if (status === 'Completed') return 'success';
    return 'secondary';
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h2 className="mb-1" id="tournamentHistoryHeading">
                Tournament History
              </h2>
              <p className="text-muted mb-0" id="tournamentHistoryDescription">
                Review all tournaments linked to your player account.
              </p>
            </div>
            <Badge
              bg="dark"
              pill
              aria-label={`${tournamentHistory.length} tournament history records`}
            >
              {tournamentHistory.length} Records
            </Badge>
          </div>

          {loading && (
            <div className="text-center py-5" role="status" aria-live="polite">
              <Spinner animation="border" aria-hidden="true" />
              <p className="mt-3 mb-0">Loading tournament history...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" role="alert" aria-live="assertive">
              {error.message || 'Failed to load tournament history.'}
            </Alert>
          )}

          {!loading && !error && tournamentHistory.length === 0 && (
            <Alert variant="secondary" className="mb-0" role="status" aria-live="polite">
              Your tournament history is currently empty.
            </Alert>
          )}

          {!loading && !error && tournamentHistory.length > 0 && (
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                align="middle"
                aria-labelledby="tournamentHistoryHeading"
                aria-describedby="tournamentHistoryDescription"
              >
                <caption className="visually-hidden">
                  List of tournaments in your player history including name, game, date, status, and number of players.
                </caption>
                <thead className="table-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Tournament Name</th>
                    <th scope="col">Game</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Players in Tournament</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentHistory.map((tournament, index) => (
                    <tr key={tournament.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{tournament.name}</td>
                      <td>{tournament.game}</td>
                      <td>
                        <time dateTime={new Date(tournament.date).toISOString()}>
                          {new Date(tournament.date).toLocaleString()}
                        </time>
                      </td>
                      <td>
                        <Badge
                          bg={getStatusBadge(tournament.status)}
                          aria-label={`Status: ${tournament.status}`}
                        >
                          {tournament.status}
                        </Badge>
                      </td>
                      <td>{tournament.players?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TournamentHistory;
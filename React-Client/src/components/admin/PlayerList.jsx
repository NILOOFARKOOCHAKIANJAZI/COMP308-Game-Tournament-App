import React from 'react';
import { useQuery } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import { GET_PLAYERS } from '../../graphql/queries.js';

function PlayerList() {
  const { data, loading, error } = useQuery(GET_PLAYERS, {
    fetchPolicy: 'network-only'
  });

  const players = data?.players ?? [];

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h2 className="mb-1" id="playerListHeading">
                Player List
              </h2>
              <p className="text-muted mb-0" id="playerListDescription">
                Review all player profiles and their tournament participation.
              </p>
            </div>
            <Badge bg="dark" pill aria-label={`${players.length} players in the system`}>
              {players.length} Players
            </Badge>
          </div>

          {loading && (
            <div className="text-center py-5" role="status" aria-live="polite">
              <Spinner animation="border" aria-hidden="true" />
              <p className="mt-3 mb-0">Loading players...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" role="alert" aria-live="assertive">
              {error.message || 'Failed to load players.'}
            </Alert>
          )}

          {!loading && !error && players.length === 0 && (
            <Alert variant="secondary" className="mb-0" role="status" aria-live="polite">
              No players found in the system.
            </Alert>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="table-responsive">
              <Table
                striped
                bordered
                hover
                align="middle"
                aria-labelledby="playerListHeading"
                aria-describedby="playerListDescription"
              >
                <caption className="visually-hidden">
                  List of all players including username, email, role, ranking, and tournament participation count.
                </caption>
                <thead className="table-dark">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Username</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Ranking</th>
                    <th scope="col">Tournaments Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={player.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{player.user?.username || 'N/A'}</td>
                      <td>{player.user?.email || 'N/A'}</td>
                      <td>{player.user?.role || 'N/A'}</td>
                      <td>{player.ranking}</td>
                      <td>{player.tournaments?.length || 0}</td>
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

export default PlayerList;
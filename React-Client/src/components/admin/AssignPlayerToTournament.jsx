import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { ASSIGN_PLAYER_TO_TOURNAMENT_MUTATION } from '../../graphql/mutations.js';
import { GET_PLAYERS, GET_TOURNAMENTS } from '../../graphql/queries.js';

function AssignPlayerToTournament() {
  const [formData, setFormData] = useState({
    playerId: '',
    tournamentId: ''
  });

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    playerId: '',
    tournamentId: ''
  });

  const errorAlertRef = useRef(null);
  const successAlertRef = useRef(null);

  const {
    data: playersData,
    loading: playersLoading,
    error: playersError
  } = useQuery(GET_PLAYERS, {
    fetchPolicy: 'network-only'
  });

  const {
    data: tournamentsData,
    loading: tournamentsLoading,
    error: tournamentsError
  } = useQuery(GET_TOURNAMENTS, {
    fetchPolicy: 'network-only'
  });

  const [assignPlayerToTournament, { loading: assignLoading }] = useMutation(
    ASSIGN_PLAYER_TO_TOURNAMENT_MUTATION,
    {
      refetchQueries: [GET_PLAYERS, GET_TOURNAMENTS]
    }
  );

  const players = playersData?.players ?? [];
  const tournaments = tournamentsData?.tournaments ?? [];

  const availableTournaments = useMemo(
    () => tournaments.filter((tournament) => tournament.status === 'Upcoming'),
    [tournaments]
  );

  const selectedTournament = useMemo(
    () => tournaments.find((tournament) => tournament.id === formData.tournamentId),
    [tournaments, formData.tournamentId]
  );

  useEffect(() => {
    if (formError && errorAlertRef.current) {
      errorAlertRef.current.focus();
    }
  }, [formError]);

  useEffect(() => {
    if (successMessage && successAlertRef.current) {
      successAlertRef.current.focus();
    }
  }, [successMessage]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    if (formError) {
      setFormError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const nextFieldErrors = {
      playerId: '',
      tournamentId: ''
    };

    if (!formData.playerId) {
      nextFieldErrors.playerId = 'Please select a player.';
    }

    if (!formData.tournamentId) {
      nextFieldErrors.tournamentId = 'Please select a tournament.';
    }

    setFieldErrors(nextFieldErrors);

    const hasAnyError = Object.values(nextFieldErrors).some(Boolean);

    if (hasAnyError) {
      setFormError('Please select both a player and a tournament.');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      playerId: '',
      tournamentId: ''
    });

    setFieldErrors({
      playerId: '',
      tournamentId: ''
    });

    setFormError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await assignPlayerToTournament({
        variables: {
          playerId: formData.playerId,
          tournamentId: formData.tournamentId
        }
      });

      if (data?.assignPlayerToTournament) {
        setSuccessMessage(
          `Player was assigned successfully to "${data.assignPlayerToTournament.name}".`
        );
        resetForm();
      }
    } catch (error) {
      setFormError(error.message || 'Failed to assign player to tournament.');
    }
  };

  if (playersLoading || tournamentsLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5" role="status" aria-live="polite">
          <Spinner animation="border" aria-hidden="true" />
          <p className="mt-3 mb-0">Loading assignment data...</p>
        </div>
      </Container>
    );
  }

  if (playersError || tournamentsError) {
    return (
      <Container className="py-4">
        <Alert variant="danger" role="alert" aria-live="assertive">
          {playersError?.message ||
            tournamentsError?.message ||
            'Failed to load players or tournaments.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="content-container">
      <div className="page-card">
        <Card className="section-card">
          <Card.Body className="p-4">
            <h2 className="mb-3" id="assignPlayerHeading">
              Assign Player to Tournament
            </h2>
            <p className="text-muted mb-4" id="assignPlayerDescription">
              Assign a player to an upcoming tournament from the admin portal.
            </p>

            {formError && (
              <Alert
                ref={errorAlertRef}
                variant="danger"
                onClose={() => setFormError('')}
                dismissible
                role="alert"
                aria-live="assertive"
                tabIndex="-1"
              >
                {formError}
              </Alert>
            )}

            {successMessage && (
              <Alert
                ref={successAlertRef}
                variant="success"
                onClose={() => setSuccessMessage('')}
                dismissible
                role="status"
                aria-live="polite"
                tabIndex="-1"
              >
                {successMessage}
              </Alert>
            )}

            {players.length === 0 && (
              <Alert variant="warning" role="alert" aria-live="assertive">
                No players are available. Please create a Player user first.
              </Alert>
            )}

            {availableTournaments.length === 0 && (
              <Alert variant="warning" role="alert" aria-live="assertive">
                No upcoming tournaments are available. Please create an upcoming tournament first.
              </Alert>
            )}

            <Form
              onSubmit={handleSubmit}
              noValidate
              aria-labelledby="assignPlayerHeading"
              aria-describedby="assignPlayerDescription"
            >
              <Form.Group className="mb-3" controlId="assignPlayerSelect">
                <Form.Label>Select Player</Form.Label>
                <Form.Select
                  name="playerId"
                  value={formData.playerId}
                  onChange={handleChange}
                  disabled={players.length === 0}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.playerId}
                  aria-invalid={!!fieldErrors.playerId}
                  aria-describedby={
                    fieldErrors.playerId
                      ? 'assignPlayerSelectError'
                      : 'assignPlayerSelectHelp'
                  }
                >
                  <option value="">Choose a player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.user?.username} ({player.user?.email}) - Ranking: {player.ranking}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text id="assignPlayerSelectHelp" muted>
                  Select an available player profile to assign to a tournament.
                </Form.Text>
                <Form.Control.Feedback
                  type="invalid"
                  id="assignPlayerSelectError"
                >
                  {fieldErrors.playerId}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="assignTournamentSelect">
                <Form.Label>Select Tournament</Form.Label>
                <Form.Select
                  name="tournamentId"
                  value={formData.tournamentId}
                  onChange={handleChange}
                  disabled={availableTournaments.length === 0}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.tournamentId}
                  aria-invalid={!!fieldErrors.tournamentId}
                  aria-describedby={
                    fieldErrors.tournamentId
                      ? 'assignTournamentSelectError'
                      : 'assignTournamentSelectHelp'
                  }
                >
                  <option value="">Choose an upcoming tournament</option>
                  {availableTournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name} - {tournament.game} -{' '}
                      {new Date(tournament.date).toLocaleString()}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text id="assignTournamentSelectHelp" muted>
                  Only tournaments with Upcoming status are available for assignment.
                </Form.Text>
                <Form.Control.Feedback
                  type="invalid"
                  id="assignTournamentSelectError"
                >
                  {fieldErrors.tournamentId}
                </Form.Control.Feedback>
              </Form.Group>

              {selectedTournament && (
                <Alert
                  variant="secondary"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <strong>Selected Tournament:</strong> {selectedTournament.name} <br />
                  <strong>Game:</strong> {selectedTournament.game} <br />
                  <strong>Date:</strong>{' '}
                  {new Date(selectedTournament.date).toLocaleString()} <br />
                  <strong>Current Players:</strong> {selectedTournament.players?.length || 0}
                </Alert>
              )}

              <div className="d-flex gap-2 flex-wrap">
                <Button
                  type="submit"
                  variant="dark"
                  disabled={
                    assignLoading ||
                    players.length === 0 ||
                    availableTournaments.length === 0
                  }
                  aria-busy={assignLoading}
                >
                  {assignLoading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                        aria-hidden="true"
                      />
                      Assigning...
                    </>
                  ) : (
                    'Assign Player'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={resetForm}
                  disabled={assignLoading}
                >
                  Reset
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default AssignPlayerToTournament;
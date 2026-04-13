import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

import { JOIN_TOURNAMENT_MUTATION } from '../../graphql/mutations.js';
import {
  GET_MY_TOURNAMENT_HISTORY,
  GET_TOURNAMENTS,
  GET_UPCOMING_TOURNAMENTS
} from '../../graphql/queries.js';

function JoinTournamentButton({ tournamentId, disabled = false, onJoined }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const errorAlertRef = useRef(null);
  const successAlertRef = useRef(null);

  const [joinTournament, { loading }] = useMutation(JOIN_TOURNAMENT_MUTATION, {
    refetchQueries: [
      GET_UPCOMING_TOURNAMENTS,
      GET_MY_TOURNAMENT_HISTORY,
      GET_TOURNAMENTS
    ]
  });

  useEffect(() => {
    if (errorMessage && errorAlertRef.current) {
      errorAlertRef.current.focus();
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage && successAlertRef.current) {
      successAlertRef.current.focus();
    }
  }, [successMessage]);

  const handleJoinTournament = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { data } = await joinTournament({
        variables: {
          tournamentId
        }
      });

      if (data?.joinTournament) {
        setSuccessMessage(`You joined "${data.joinTournament.name}" successfully.`);

        if (onJoined) {
          onJoined(data.joinTournament);
        }
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to join tournament.');
    }
  };

  return (
    <div>
      {errorMessage && (
        <Alert
          ref={errorAlertRef}
          variant="danger"
          className="mt-2 mb-2 py-2"
          onClose={() => setErrorMessage('')}
          dismissible
          role="alert"
          aria-live="assertive"
          tabIndex="-1"
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert
          ref={successAlertRef}
          variant="success"
          className="mt-2 mb-2 py-2"
          onClose={() => setSuccessMessage('')}
          dismissible
          role="status"
          aria-live="polite"
          tabIndex="-1"
        >
          {successMessage}
        </Alert>
      )}

      <Button
        variant="dark"
        onClick={handleJoinTournament}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-label="Join tournament"
      >
        {loading ? (
          <>
            <Spinner
              animation="border"
              size="sm"
              className="me-2"
              aria-hidden="true"
            />
            Joining...
          </>
        ) : (
          'Join Tournament'
        )}
      </Button>
    </div>
  );
}

export default JoinTournamentButton;
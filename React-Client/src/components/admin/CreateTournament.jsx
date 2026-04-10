import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { CREATE_TOURNAMENT_MUTATION } from '../../graphql/mutations.js';
import { GET_TOURNAMENTS, GET_UPCOMING_TOURNAMENTS } from '../../graphql/queries.js';

function CreateTournament() {
  const errorRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    game: '',
    date: '',
    status: 'Upcoming'
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    game: '',
    date: '',
    status: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const [createTournament, { loading }] = useMutation(CREATE_TOURNAMENT_MUTATION, {
    refetchQueries: [GET_TOURNAMENTS, GET_UPCOMING_TOURNAMENTS]
  });

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.focus();
    }
  }, [formError]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));

    if (formError) {
      setFormError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      game: '',
      date: '',
      status: 'Upcoming'
    });

    setFieldErrors({
      name: '',
      game: '',
      date: '',
      status: ''
    });

    setFormError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const errors = {
      name: '',
      game: '',
      date: '',
      status: ''
    };

    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Tournament name is required.';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Tournament name must be at least 3 characters long.';
      isValid = false;
    }

    if (!formData.game.trim()) {
      errors.game = 'Game name is required.';
      isValid = false;
    } else if (formData.game.trim().length < 2) {
      errors.game = 'Game name must be at least 2 characters long.';
      isValid = false;
    }

    if (!formData.date) {
      errors.date = 'Date and time are required.';
      isValid = false;
    } else {
      const parsedDate = new Date(formData.date);
      if (Number.isNaN(parsedDate.getTime())) {
        errors.date = 'Please enter a valid date and time.';
        isValid = false;
      }
    }

    if (!formData.status) {
      errors.status = 'Tournament status is required.';
      isValid = false;
    } else if (!['Upcoming', 'Ongoing', 'Completed'].includes(formData.status)) {
      errors.status = 'Please select a valid tournament status.';
      isValid = false;
    }

    setFieldErrors(errors);

    if (!isValid) {
      setFormError('Please correct the highlighted fields and try again.');
    }

    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const isoDate = new Date(formData.date).toISOString();

      const { data } = await createTournament({
        variables: {
          name: formData.name.trim(),
          game: formData.game.trim(),
          date: isoDate,
          status: formData.status
        }
      });

      if (data?.createTournament) {
        setSuccessMessage(
          `Tournament "${data.createTournament.name}" was created successfully.`
        );
        setFormData({
          name: '',
          game: '',
          date: '',
          status: 'Upcoming'
        });
        setFieldErrors({
          name: '',
          game: '',
          date: '',
          status: ''
        });
      }
    } catch (error) {
      setFormError(error.message || 'Failed to create tournament.');
    }
  };

  return (
    <Container className="content-container">
      <div className="page-card">
        <Card className="section-card">
          <Card.Body className="p-4">
            <h2 className="mb-3">Create Tournament</h2>
            <p className="text-muted mb-4">
              Add a new gaming tournament with date, game, and status.
            </p>

            {formError && (
              <Alert
                ref={errorRef}
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
                variant="success"
                onClose={() => setSuccessMessage('')}
                dismissible
                role="status"
                aria-live="polite"
              >
                {successMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3" controlId="createTournamentName">
                <Form.Label>
                  Tournament Name <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter tournament name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.name}
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={
                    fieldErrors.name ? 'createTournamentNameError' : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createTournamentNameError"
                >
                  {fieldErrors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="createTournamentGame">
                <Form.Label>
                  Game <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="game"
                  placeholder="Enter game title"
                  value={formData.game}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.game}
                  aria-invalid={!!fieldErrors.game}
                  aria-describedby={
                    fieldErrors.game ? 'createTournamentGameError' : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createTournamentGameError"
                >
                  {fieldErrors.game}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="createTournamentDate">
                <Form.Label>
                  Date and Time <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.date}
                  aria-invalid={!!fieldErrors.date}
                  aria-describedby={
                    fieldErrors.date ? 'createTournamentDateError' : 'createTournamentDateHelp'
                  }
                />
                <Form.Text id="createTournamentDateHelp" muted>
                  Enter the scheduled date and start time for the tournament.
                </Form.Text>
                <Form.Control.Feedback
                  type="invalid"
                  id="createTournamentDateError"
                >
                  {fieldErrors.date}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="createTournamentStatus">
                <Form.Label>
                  Status <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.status}
                  aria-invalid={!!fieldErrors.status}
                  aria-describedby={
                    fieldErrors.status ? 'createTournamentStatusError' : undefined
                  }
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
                <Form.Control.Feedback
                  type="invalid"
                  id="createTournamentStatusError"
                >
                  {fieldErrors.status}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex gap-2 flex-wrap">
                <Button
                  type="submit"
                  variant="dark"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                        aria-hidden="true"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Tournament'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={resetForm}
                  disabled={loading}
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

export default CreateTournament;
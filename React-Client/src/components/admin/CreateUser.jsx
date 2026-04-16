import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { CREATE_USER_MUTATION } from '../../graphql/mutations.js';
import { GET_PLAYERS, GET_USERS } from '../../graphql/queries.js';

function CreateUser() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Player'
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const errorAlertRef = useRef(null);
  const successAlertRef = useRef(null);

  const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION, {
    refetchQueries: [GET_USERS, GET_PLAYERS]
  });

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

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Player'
    });

    setFieldErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    });

    setFormError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const nextFieldErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };

    if (!formData.username.trim()) {
      nextFieldErrors.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      nextFieldErrors.username = 'Username must be at least 3 characters long.';
    }

    if (!formData.email.trim()) {
      nextFieldErrors.email = 'Email address is required.';
    }

    if (!formData.password) {
  nextFieldErrors.password = 'Password is required.';
} else if (formData.password.length < 8) {
  nextFieldErrors.password = 'Password must be at least 8 characters long.';
} else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
  nextFieldErrors.password =
    'Password must contain at least one letter and one number.';
}

    if (!formData.confirmPassword) {
      nextFieldErrors.confirmPassword = 'Please confirm the password.';
    } else if (formData.password !== formData.confirmPassword) {
      nextFieldErrors.confirmPassword =
        'Password and confirm password do not match.';
    }

    if (!formData.role) {
      nextFieldErrors.role = 'Role is required.';
    } else if (!['Admin', 'Player'].includes(formData.role)) {
      nextFieldErrors.role = 'Please select a valid role.';
    }

    setFieldErrors(nextFieldErrors);

    const firstError = Object.values(nextFieldErrors).find(Boolean);

    if (firstError) {
      setFormError('Please review the highlighted fields and try again.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await createUser({
        variables: {
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        }
      });

      if (data?.createUser) {
        setSuccessMessage(
          `User "${data.createUser.username}" was created successfully as ${data.createUser.role}.`
        );
        resetForm();
      }
    } catch (error) {
      setFormError(error.message || 'Failed to create user.');
    }
  };

  return (
    <Container className="content-container">
      <div className="page-card">
        <Card className="section-card">
          <Card.Body className="p-4">
            <h2 className="mb-3" id="createUserHeading">
              Create User
            </h2>
            <p className="text-muted mb-4" id="createUserDescription">
              Add a new Admin or Player account to the system.
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

            <Form
              onSubmit={handleSubmit}
              noValidate
              aria-labelledby="createUserHeading"
              aria-describedby="createUserDescription"
            >
              <Form.Group className="mb-3" controlId="createUserUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.username}
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={
                    fieldErrors.username ? 'createUserUsernameError' : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createUserUsernameError"
                >
                  {fieldErrors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="createUserEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.email}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={
                    fieldErrors.email ? 'createUserEmailError' : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createUserEmailError"
                >
                  {fieldErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="createUserPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.password}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? 'createUserPasswordError' : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createUserPasswordError"
                >
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="createUserConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.confirmPassword}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? 'createUserConfirmPasswordError'
                      : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="createUserConfirmPasswordError"
                >
                  {fieldErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="createUserRole">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.role}
                  aria-invalid={!!fieldErrors.role}
                  aria-describedby={
                    fieldErrors.role ? 'createUserRoleError' : 'createUserRoleHelp'
                  }
                >
                  <option value="Player">Player</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
                <Form.Text id="createUserRoleHelp" muted>
                  Select the account type for the new user.
                </Form.Text>
                <Form.Control.Feedback type="invalid" id="createUserRoleError">
                  {fieldErrors.role}
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
                    'Create User'
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

export default CreateUser;
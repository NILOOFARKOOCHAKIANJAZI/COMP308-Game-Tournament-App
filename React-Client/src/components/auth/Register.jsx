import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { REGISTER_MUTATION } from '../../graphql/mutations.js';
import { useAuth } from '../../context/AuthContext.jsx';

function Register() {
  const navigate = useNavigate();
  const { refreshAuth, isAuthenticated, role, loading: authLoading } = useAuth();

  const errorRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Player',
    adminSecretKey: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    adminSecretKey: ''
  });

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [registerUser, { loading }] = useMutation(REGISTER_MUTATION);

  const redirectUserByRole = (userRole) => {
    if (userRole === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (userRole === 'Player') {
      navigate('/player', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      redirectUserByRole(role);
    }
  }, [authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.focus();
    }
  }, [formError]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'role' && value !== 'Admin' ? { adminSecretKey: '' } : {})
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: '',
      ...(name === 'role' && value !== 'Admin' ? { adminSecretKey: '' } : {})
    }));

    if (formError) {
      setFormError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      adminSecretKey: ''
    };

    let isValid = true;

    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
      isValid = false;
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      isValid = false;
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errors.password = 'Password must contain at least one letter and one number.';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Password and confirm password do not match.';
      isValid = false;
    }

    if (formData.role === 'Admin' && !formData.adminSecretKey.trim()) {
      errors.adminSecretKey = 'Admin secret key is required for admin registration.';
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
      const { data } = await registerUser({
        variables: {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          adminSecretKey:
            formData.role === 'Admin' ? formData.adminSecretKey.trim() : null
        }
      });

      if (data?.register?.message) {
        setSuccessMessage(data.register.message);
      }

      await refreshAuth();

      const registeredRole = data?.register?.user?.role;
      redirectUserByRole(registeredRole);
    } catch (error) {
      setFormError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container className="content-container">
      <div className="page-card">
        <Card className="section-card">
          <Card.Body className="p-4">
            <h2 className="mb-3 text-center">Register</h2>
            <p className="text-muted text-center mb-4">
              Create your account to join and manage tournaments.
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
              <Form.Group className="mb-3" controlId="registerUsername">
                <Form.Label>
                  Username <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.username}
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={
                    fieldErrors.username ? 'registerUsernameError' : undefined
                  }
                />
                <Form.Control.Feedback type="invalid" id="registerUsernameError">
                  {fieldErrors.username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerEmail">
                <Form.Label>
                  Email Address <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.email}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'registerEmailError' : undefined}
                />
                <Form.Control.Feedback type="invalid" id="registerEmailError">
                  {fieldErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerPassword">
                <Form.Label>
                  Password <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.password}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? 'registerPasswordError' : 'registerPasswordHelp'
                  }
                />
                <Form.Text id="registerPasswordHelp" muted>
                  Use at least 8 characters, including at least one letter and one number.
                </Form.Text>
                <Form.Control.Feedback type="invalid" id="registerPasswordError">
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerConfirmPassword">
                <Form.Label>
                  Confirm Password <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.confirmPassword}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? 'registerConfirmPasswordError'
                      : undefined
                  }
                />
                <Form.Control.Feedback
                  type="invalid"
                  id="registerConfirmPasswordError"
                >
                  {fieldErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerRole">
                <Form.Label>
                  Account Type <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.role}
                  aria-invalid={!!fieldErrors.role}
                  aria-describedby={fieldErrors.role ? 'registerRoleError' : undefined}
                >
                  <option value="Player">Player</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid" id="registerRoleError">
                  {fieldErrors.role}
                </Form.Control.Feedback>
              </Form.Group>

              {formData.role === 'Admin' && (
                <Form.Group className="mb-4" controlId="registerAdminSecretKey">
                  <Form.Label>
                    Admin Secret Key <span aria-hidden="true">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="adminSecretKey"
                    placeholder="Enter admin secret key"
                    value={formData.adminSecretKey}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                    aria-required="true"
                    isInvalid={!!fieldErrors.adminSecretKey}
                    aria-invalid={!!fieldErrors.adminSecretKey}
                    aria-describedby={
                      fieldErrors.adminSecretKey
                        ? 'registerAdminSecretKeyError'
                        : undefined
                    }
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    id="registerAdminSecretKeyError"
                  >
                    {fieldErrors.adminSecretKey}
                  </Form.Control.Feedback>
                </Form.Group>
              )}

              <div className="d-grid">
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
                      Registering...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login">Login here</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Register;
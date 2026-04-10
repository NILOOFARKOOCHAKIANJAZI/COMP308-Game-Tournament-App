import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import { LOGIN_MUTATION } from '../../graphql/mutations.js';
import { useAuth } from '../../context/AuthContext.jsx';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth, isAuthenticated, role, loading: authLoading } = useAuth();

  const errorRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION);

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

  const validateForm = () => {
    const errors = {
      email: '',
      password: ''
    };

    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required.';
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
      const { data } = await loginUser({
        variables: {
          email: formData.email.trim(),
          password: formData.password
        }
      });

      if (data?.login?.message) {
        setSuccessMessage(data.login.message);
      }

      await refreshAuth();

      const loggedInRole = data?.login?.user?.role;
      const redirectPath = location.state?.from?.pathname;

      if (redirectPath && redirectPath !== '/login') {
        navigate(redirectPath, { replace: true });
        return;
      }

      redirectUserByRole(loggedInRole);
    } catch (error) {
      setFormError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <Container className="content-container">
      <div className="page-card">
        <Card className="section-card">
          <Card.Body className="p-4">
            <h2 className="mb-3 text-center">Login</h2>
            <p className="text-muted text-center mb-4">
              Sign in to access your gaming tournaments portal.
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
              <Form.Group className="mb-3" controlId="loginEmail">
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
                  aria-describedby={fieldErrors.email ? 'loginEmailError' : undefined}
                />
                <Form.Control.Feedback type="invalid" id="loginEmailError">
                  {fieldErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="loginPassword">
                <Form.Label>
                  Password <span aria-hidden="true">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  isInvalid={!!fieldErrors.password}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? 'loginPasswordError' : undefined
                  }
                />
                <Form.Control.Feedback type="invalid" id="loginPasswordError">
                  {fieldErrors.password}
                </Form.Control.Feedback>
              </Form.Group>

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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </Form>

            <div className="text-center mt-4">
              <span className="text-muted">Don&apos;t have an account? </span>
              <Link to="/register">Register here</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Login;
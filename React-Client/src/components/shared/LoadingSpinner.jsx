import React from 'react';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';

function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <Container className="py-5 text-center">
      <Spinner animation="border" role="status" />
      <p className="mt-3 mb-0 text-muted">{message}</p>
    </Container>
  );
}

export default LoadingSpinner;
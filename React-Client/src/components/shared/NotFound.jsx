import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

function NotFound() {
  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card
          className="shadow-sm border-0 text-center"
          style={{ maxWidth: '500px', width: '100%' }}
        >
          <Card.Body className="p-5">
            <h1 className="display-4 fw-bold">404</h1>

            <h3 className="mb-3">Page Not Found</h3>

            <p className="text-muted mb-4">
              The page you are looking for does not exist or may have been moved.
            </p>

            <Button as={Link} to="/" variant="dark">
              Back to Home
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default NotFound;
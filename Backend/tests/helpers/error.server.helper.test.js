const { getErrorMessage } = require('../../app/helpers/error.server.helper');

describe('getErrorMessage', () => {
  it('returns default message when error is missing', () => {
    expect(getErrorMessage()).toBe('Unknown server error');
  });

  it('returns custom error message for normal Error objects', () => {
    expect(getErrorMessage(new Error('Custom problem'))).toBe('Custom problem');
  });

  it('handles mongoose validation errors', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        email: { message: 'Email is required' },
        password: { message: 'Password is too short' }
      }
    };

    expect(getErrorMessage(err)).toBe('Email is required, Password is too short');
  });

  it('handles duplicate tournament compound key errors', () => {
    const err = {
      code: 11000,
      keyPattern: {
        name: 1,
        game: 1,
        date: 1,
        status: 1
      }
    };

    expect(getErrorMessage(err)).toBe(
      'A tournament with the same name, game, date, and status already exists.'
    );
  });

  it('handles duplicate field errors', () => {
    const err = {
      code: 11000,
      keyPattern: {
        email: 1
      }
    };

    expect(getErrorMessage(err)).toBe('email already exists');
  });

  it('handles generic duplicate key errors', () => {
    const err = {
      code: 11000
    };

    expect(getErrorMessage(err)).toBe('Duplicate value already exists');
  });

  it('handles cast errors', () => {
    const err = {
      name: 'CastError',
      path: 'userId'
    };

    expect(getErrorMessage(err)).toBe('Invalid userId');
  });

  it('handles invalid jwt errors', () => {
    const err = {
      name: 'JsonWebTokenError'
    };

    expect(getErrorMessage(err)).toBe('Invalid authentication token');
  });

  it('handles expired jwt errors', () => {
    const err = {
      name: 'TokenExpiredError'
    };

    expect(getErrorMessage(err)).toBe('Authentication token has expired');
  });

  it('hides mongo internal messages', () => {
    const err = {
      message: 'Mongo timeout happened'
    };

    expect(getErrorMessage(err)).toBe('Database error occurred');
  });
});
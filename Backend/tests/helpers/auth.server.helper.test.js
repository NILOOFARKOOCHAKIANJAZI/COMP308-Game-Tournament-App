jest.mock('../../app/models/user.server.model', () => ({
  findById: jest.fn()
}));

const jwt = require('jsonwebtoken');
const User = require('../../app/models/user.server.model');
const config = require('../../config/config');
const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  getUserFromToken,
  requireAuth,
  requireRole
} = require('../../app/helpers/auth.server.helper');

describe('auth.server.helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generateToken returns a jwt string', () => {
    const token = generateToken({ _id: '507f1f77bcf86cd799439011', role: 'Admin' });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  it('setAuthCookie sets cookie on response', () => {
    const res = { cookie: jest.fn() };
    setAuthCookie(res, 'abc123');

    expect(res.cookie).toHaveBeenCalledWith(
      config.cookieName,
      'abc123',
      expect.objectContaining({
        httpOnly: true
      })
    );
  });

  it('clearAuthCookie clears cookie on response', () => {
    const res = { clearCookie: jest.fn() };
    clearAuthCookie(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      config.cookieName,
      expect.any(Object)
    );
  });

  it('getUserFromToken returns null when no cookie exists', async () => {
    const req = { cookies: {} };
    const result = await getUserFromToken(req);
    expect(result).toBeNull();
  });

  it('getUserFromToken returns null when token is invalid', async () => {
    const req = { cookies: { [config.cookieName]: 'badtoken' } };
    const result = await getUserFromToken(req);
    expect(result).toBeNull();
  });

  it('getUserFromToken returns null when user is not found', async () => {
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    User.findById.mockResolvedValue(null);

    const req = { cookies: { [config.cookieName]: token } };
    const result = await getUserFromToken(req);

    expect(result).toBeNull();
    expect(User.findById).toHaveBeenCalled();
  });

  it('getUserFromToken returns user when token is valid', async () => {
    const user = { _id: '507f1f77bcf86cd799439011', role: 'Admin' };
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    User.findById.mockResolvedValue(user);

    const req = { cookies: { [config.cookieName]: token } };
    const result = await getUserFromToken(req);

    expect(result).toEqual(user);
  });

  it('requireAuth throws when user is missing', () => {
    expect(() => requireAuth(null)).toThrow('Authentication required');
  });

  it('requireAuth returns user when present', () => {
    const user = { role: 'Player' };
    expect(requireAuth(user)).toBe(user);
  });

  it('requireRole throws when role does not match', () => {
    expect(() => requireRole({ role: 'Player' }, 'Admin')).toThrow(
      'Access denied. Admin role required'
    );
  });

  it('requireRole returns user when role matches', () => {
    const user = { role: 'Admin' };
    expect(requireRole(user, 'Admin')).toBe(user);
  });
});
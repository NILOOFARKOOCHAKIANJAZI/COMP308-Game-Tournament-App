const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const User = require('../models/user.server.model');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * Set auth token in httpOnly cookie
 */
const setAuthCookie = (res, token) => {
  if (!res) return;

  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: true,
    sameSite: isProduction ? 'none' : 'none',
    maxAge: 24 * 60 * 60 * 1000
  });
};

/**
 * Clear auth cookie on logout
 */
const clearAuthCookie = (res) => {
  if (!res) return;

  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: true,
    sameSite: isProduction ? 'none' : 'none'
  });
};

/**
 * Extract current user from request cookie token
 */
const getUserFromToken = async (req) => {
  try {
    if (!req || !req.cookies) {
      return null;
    }

    const token = req.cookies[config.cookieName];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
};

/**
 * Require a logged-in user
 */
const requireAuth = (user) => {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

/**
 * Require a specific role
 */
const requireRole = (user, role) => {
  requireAuth(user);

  if (user.role !== role) {
    throw new Error(`Access denied. ${role} role required`);
  }

  return user;
};

module.exports = {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
  getUserFromToken,
  requireAuth,
  requireRole
};

const { getUserFromToken } = require('../helpers/auth.server.helper');

/**
 * Optional authentication middleware
 * If token exists and is valid, attaches user to req.auth
 * If not valid, continues without throwing
 */
const attachCurrentUser = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    req.auth = user || null;
    next();
  } catch (error) {
    req.auth = null;
    next();
  }
};

/**
 * Required authentication middleware
 * Blocks access if user is not logged in
 */
const requireSignin = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    req.auth = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token'
    });
  }
};

module.exports = {
  attachCurrentUser,
  requireSignin
};
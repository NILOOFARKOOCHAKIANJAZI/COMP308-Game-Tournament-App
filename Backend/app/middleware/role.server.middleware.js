/**
 * Require Admin role
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.auth.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

/**
 * Require Player role
 */
const requirePlayer = (req, res, next) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.auth.role !== 'Player') {
      return res.status(403).json({
        success: false,
        message: 'Player access required'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

/**
 * Generic role middleware
 * Example: requireRole('Admin')
 */
const requireRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.auth) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (req.auth.role !== role) {
        return res.status(403).json({
          success: false,
          message: `${role} access required`
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requirePlayer,
  requireRole
};
/**
 * Restrict route access to specified roles
 * @param  {...string} roles - e.g. 'seller', 'admin', 'customer'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking role authorization.',
        data: null
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource.`,
        data: null
      });
    }

    next();
  };
};

module.exports = {
  authorize
};

// middlewares/roleMiddleware.js
module.exports = function(requiredRoles) {
  return function(req, res, next) {
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }
    next();
  };
};
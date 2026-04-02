// Usage: requireRole("lister") or requireRole("seeker")
// Always use AFTER verifyToken — needs req.user to exist

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: `Access denied — ${role}s only`,
      });
    }

    next();
  };
}

module.exports = requireRole;
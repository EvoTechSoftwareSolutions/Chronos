const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };

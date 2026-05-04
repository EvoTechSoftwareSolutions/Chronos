import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

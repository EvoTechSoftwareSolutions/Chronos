function applySecurityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: http://localhost:* https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http://localhost:*"
  );
  next();
}

module.exports = { applySecurityHeaders };

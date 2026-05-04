const buckets = new Map();

function cleanupExpired(now) {
  for (const [key, value] of buckets.entries()) {
    if (value.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

function createRateLimiter({ windowMs, max, message }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = buckets.get(key);

    if (!current || current.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      cleanupExpired(now);
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({ error: message || "Too many requests. Try again later." });
    }

    current.count += 1;
    return next();
  };
}

module.exports = { createRateLimiter };

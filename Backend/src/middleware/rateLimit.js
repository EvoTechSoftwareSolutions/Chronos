const buckets = new Map();

function cleanup(now) {
  for (const [key, value] of buckets.entries()) {
    if (value.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

export function createRateLimiter({ windowMs, max, message }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const entry = buckets.get(key);

    if (!entry || entry.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      cleanup(now);
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({ error: message || "Too many requests. Please try again later." });
    }

    entry.count += 1;
    return next();
  };
}

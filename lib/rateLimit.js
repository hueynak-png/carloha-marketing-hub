const store = new Map();

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key, { windowMs = 60_000, max = 5 } = {}) {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now - record.startedAt >= windowMs) {
    store.set(key, { count: 1, startedAt: now });
    return { allowed: true, remaining: max - 1 };
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - record.startedAt) };
  }

  record.count += 1;
  store.set(key, record);
  return { allowed: true, remaining: max - record.count };
}

const VISITOR_KEY = "urban-spice-visitor-id";

export function getVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing && /^[A-Za-z0-9_-]{16,100}$/.test(existing)) return existing;

  const visitorId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}
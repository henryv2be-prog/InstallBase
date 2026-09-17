import "server-only";

export function getVapidPublicKey() {
  return (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || "").trim();
}

export function getVapidPrivateKey() {
  return (process.env.VAPID_PRIVATE_KEY || "").trim();
}

export function getVapidSubject() {
  const raw = process.env.VAPID_SUBJECT?.trim() || "mailto:hello@installbase.io";
  if (/^(mailto|https):/i.test(raw)) return raw;
  if (raw.includes("@")) return `mailto:${raw}`;
  return `https://${raw}`;
}

export function isPushConfigured() {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}

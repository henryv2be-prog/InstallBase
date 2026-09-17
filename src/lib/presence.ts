import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export function isOnline(lastSeenAt: Date | string | null | undefined, now = Date.now()) {
  if (!lastSeenAt) return false;
  return now - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

export function formatLastSeen(lastSeenAt: Date | string | null | undefined, now = new Date()) {
  if (!lastSeenAt) return "Offline";
  const seen = new Date(lastSeenAt);
  if (isOnline(seen, now.getTime())) return "Online";

  const diff = now.getTime() - seen.getTime();
  if (diff < 60 * 60 * 1000) {
    return `Last seen ${formatDistanceToNow(seen, { addSuffix: true })}`;
  }
  if (isToday(seen)) return `Last seen today at ${format(seen, "HH:mm")}`;
  if (isYesterday(seen)) return `Last seen yesterday at ${format(seen, "HH:mm")}`;
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `Last seen ${format(seen, "EEEE")} at ${format(seen, "HH:mm")}`;
  }
  return `Last seen ${format(seen, "d MMM yyyy")}`;
}

import { renderNotificationBadge } from "@/lib/app-icon";

export const contentType = "image/png";

export function GET() {
  return renderNotificationBadge(96);
}

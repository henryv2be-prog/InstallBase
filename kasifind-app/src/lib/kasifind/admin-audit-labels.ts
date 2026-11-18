/** Human-readable labels for KfAdminAudit.action values (no semantic changes to stored actions). */

const ACTION_LABELS: Record<string, string> = {
  "listing.approved": "Approved listing",
  "listing.rejected": "Rejected listing",
  "listing.disabled": "Disabled listing",
  "listing.featured": "Featured listing",
  "listing.unfeatured": "Removed featured flag",
  "listing.unpublished": "Unpublished listing",
  "listing.deleted": "Deleted listing",
  "listing.admin_edit": "Edited listing (admin)",
  "user.updated": "Updated user account",
  "user.deleted": "Deleted user account",
  "category.created": "Created category",
  "category.updated": "Updated category",
  "category.deleted": "Deleted category",
  "report.resolved": "Resolved user report",
};

export function formatAdminAuditActionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action.replace(/\./g, " · ").replace(/_/g, " ");
}

export function adminAuditActionKind(action: string): "listing" | "user" | "category" | "report" | "other" {
  if (action.startsWith("listing.")) return "listing";
  if (action.startsWith("user.")) return "user";
  if (action.startsWith("category.")) return "category";
  if (action.startsWith("report.")) return "report";
  return "other";
}
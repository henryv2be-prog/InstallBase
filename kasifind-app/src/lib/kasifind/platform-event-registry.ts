import type { KfNotificationPriority } from "@/generated/prisma/enums";

export type PlatformEventCategory =
  | "user"
  | "provider"
  | "listing"
  | "customer"
  | "admin"
  | "technical";

export type PlatformEventDefinition = {
  eventType: string;
  category: PlatformEventCategory;
  priority: KfNotificationPriority;
  label: string;
  description: string;
  defaultInApp: boolean;
  defaultPush: boolean;
};

/** Single registry for all admin-notifiable platform events (extensible). */
export const PLATFORM_EVENT_REGISTRY: PlatformEventDefinition[] = [
  // User
  {
    eventType: "user.registered",
    category: "user",
    priority: "INFO",
    label: "New user registration",
    description: "A new account was created on KasiFind.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "user.updated",
    category: "user",
    priority: "INFO",
    label: "User account updated",
    description: "A user profile or account details changed.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "user.suspended",
    category: "user",
    priority: "IMPORTANT",
    label: "User suspended",
    description: "An account was suspended.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "user.deleted",
    category: "user",
    priority: "IMPORTANT",
    label: "User deleted",
    description: "An account was removed.",
    defaultInApp: true,
    defaultPush: false,
  },
  // Provider
  {
    eventType: "provider.registered",
    category: "provider",
    priority: "INFO",
    label: "New provider registered",
    description: "A new provider signed up.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "provider.profile_created",
    category: "provider",
    priority: "INFO",
    label: "Provider profile created",
    description: "A provider completed initial profile setup.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "provider.profile_updated",
    category: "provider",
    priority: "INFO",
    label: "Provider profile updated",
    description: "A provider updated their profile.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "provider.listing_assistance_requested",
    category: "provider",
    priority: "IMPORTANT",
    label: "Listing assistance requested",
    description: "A provider asked for help with their listing.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "provider.listing_assistance_updated",
    category: "provider",
    priority: "INFO",
    label: "Listing assistance updated",
    description: "Status or notes changed on an assistance request.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "provider.listing_assistance_completed",
    category: "provider",
    priority: "INFO",
    label: "Listing assistance completed",
    description: "An assistance request was marked completed.",
    defaultInApp: true,
    defaultPush: false,
  },
  // Listing
  {
    eventType: "listing.created",
    category: "listing",
    priority: "IMPORTANT",
    label: "New listing created",
    description: "A new business listing was started.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "listing.submitted_for_approval",
    category: "listing",
    priority: "IMPORTANT",
    label: "Listing submitted for approval",
    description: "A listing is waiting for moderation.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "listing.approved",
    category: "listing",
    priority: "INFO",
    label: "Listing approved",
    description: "A listing was approved by moderation.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "listing.rejected",
    category: "listing",
    priority: "IMPORTANT",
    label: "Listing rejected",
    description: "A listing was rejected during moderation.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "listing.published",
    category: "listing",
    priority: "INFO",
    label: "Listing published",
    description: "A listing went live on the public site.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "listing.unpublished",
    category: "listing",
    priority: "INFO",
    label: "Listing unpublished",
    description: "A listing was taken offline.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "listing.edited",
    category: "listing",
    priority: "INFO",
    label: "Listing edited",
    description: "Listing details were updated.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "listing.deleted",
    category: "listing",
    priority: "IMPORTANT",
    label: "Listing deleted",
    description: "A listing was permanently removed.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "listing.photos_added",
    category: "listing",
    priority: "INFO",
    label: "Listing photos added",
    description: "New photos were added to a listing.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "listing.photos_removed",
    category: "listing",
    priority: "INFO",
    label: "Listing photos removed",
    description: "Photos were removed from a listing.",
    defaultInApp: false,
    defaultPush: false,
  },
  // Customer (where trackable)
  {
    eventType: "customer.whatsapp_contact",
    category: "customer",
    priority: "INFO",
    label: "WhatsApp contact",
    description: "A visitor tapped WhatsApp on a listing.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "customer.phone_contact",
    category: "customer",
    priority: "INFO",
    label: "Phone contact",
    description: "A visitor tapped call on a listing.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "customer.directions",
    category: "customer",
    priority: "INFO",
    label: "Directions requested",
    description: "A visitor requested directions to a listing.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "customer.enquiry",
    category: "customer",
    priority: "IMPORTANT",
    label: "Customer enquiry",
    description: "A customer enquiry was recorded.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "customer.listing_reported",
    category: "customer",
    priority: "IMPORTANT",
    label: "Listing reported",
    description: "A user flagged a listing for moderation.",
    defaultInApp: true,
    defaultPush: true,
  },
  // Admin
  {
    eventType: "admin.login",
    category: "admin",
    priority: "INFO",
    label: "Administrator login",
    description: "An admin signed in.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "admin.listing_moderated",
    category: "admin",
    priority: "INFO",
    label: "Listing moderated",
    description: "An administrator moderated a listing.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "admin.listing_edited",
    category: "admin",
    priority: "INFO",
    label: "Listing edited by admin",
    description: "An administrator edited a listing.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "admin.user_changed",
    category: "admin",
    priority: "INFO",
    label: "User changed by admin",
    description: "An administrator changed a user account.",
    defaultInApp: true,
    defaultPush: false,
  },
  {
    eventType: "admin.category_changed",
    category: "admin",
    priority: "INFO",
    label: "Category changed",
    description: "Taxonomy or categories were updated.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "admin.location_changed",
    category: "admin",
    priority: "INFO",
    label: "Location changed",
    description: "A location record was updated.",
    defaultInApp: false,
    defaultPush: false,
  },
  {
    eventType: "admin.notification_settings_changed",
    category: "admin",
    priority: "INFO",
    label: "Notification settings changed",
    description: "An admin updated notification preferences.",
    defaultInApp: false,
    defaultPush: false,
  },
  // Technical
  {
    eventType: "technical.background_job_failed",
    category: "technical",
    priority: "CRITICAL",
    label: "Background job failed",
    description: "A scheduled or background task failed.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "technical.listing_publish_failed",
    category: "technical",
    priority: "CRITICAL",
    label: "Listing publish failed",
    description: "A listing could not be published.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "technical.image_upload_failed",
    category: "technical",
    priority: "IMPORTANT",
    label: "Image upload failed",
    description: "An image upload or processing error occurred.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "technical.api_failure",
    category: "technical",
    priority: "CRITICAL",
    label: "Important API failure",
    description: "A critical API dependency failed.",
    defaultInApp: true,
    defaultPush: true,
  },
  {
    eventType: "technical.application_error",
    category: "technical",
    priority: "CRITICAL",
    label: "Application error",
    description: "An unexpected application error was recorded.",
    defaultInApp: true,
    defaultPush: true,
  },
];

const BY_TYPE = new Map(PLATFORM_EVENT_REGISTRY.map((d) => [d.eventType, d]));

export function getPlatformEventDefinition(eventType: string): PlatformEventDefinition | undefined {
  return BY_TYPE.get(eventType);
}

export function assertPlatformEventType(eventType: string): PlatformEventDefinition {
  const def = getPlatformEventDefinition(eventType);
  if (!def) throw new Error(`Unknown platform event type: ${eventType}`);
  return def;
}

export const PLATFORM_EVENT_TYPES = PLATFORM_EVENT_REGISTRY.map((d) => d.eventType);
export type ProviderNavAudience = {
  signedIn: boolean;
  /** User has created a provider listing (any status). */
  hasListing: boolean;
};

/** Main nav CTA for business recruitment vs Business Hub. */
export function resolveProviderNavLink(audience: ProviderNavAudience): {
  href: string;
  label: string;
} {
  if (audience.signedIn && audience.hasListing) {
    return { href: "/account", label: "Business Hub" };
  }
  return { href: "/list-your-business", label: "List Your Business" };
}

/** Registration entry from the recruitment landing page. */
export function listYourBusinessCtaHref(signedIn: boolean): string {
  return signedIn ? "/account/listing" : "/register?next=%2Faccount%2Flisting";
}
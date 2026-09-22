/** Configurable legal/contact placeholders — set via environment where available. */
export const LEGAL_SITE = {
  platformName: "InstallBase",
  legalEntityName:
    process.env.LEGAL_ENTITY_NAME?.trim() || "[Legal entity name — to be confirmed]",
  privacyContactEmail:
    process.env.PRIVACY_EMAIL?.trim() ||
    process.env.SUPPORT_EMAIL?.trim() ||
    "info@simplifiaccess.com",
  generalContactEmail:
    process.env.SUPPORT_EMAIL?.trim() ||
    process.env.PRIVACY_EMAIL?.trim() ||
    "info@simplifiaccess.com",
  governingLawCountry: "South Africa",
} as const;

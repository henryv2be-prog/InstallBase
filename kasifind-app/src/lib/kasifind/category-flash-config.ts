/** Editable theme list — one preferred category slug set per montage slot (order matters). */
export const CATEGORY_FLASH_THEMES: { id: string; slugs: string[]; label: string }[] = [
  { id: "security", slugs: ["gates-security", "metalwork-welding"], label: "Security gates & burglar bars" },
  { id: "aluminium", slugs: ["aluminium-windows"], label: "Aluminium windows" },
  { id: "plumbing", slugs: ["plumbing"], label: "Plumbing" },
  { id: "electrical", slugs: ["electrical"], label: "Electrical services" },
  { id: "automotive", slugs: ["automotive"], label: "Car repairs" },
  { id: "gas", slugs: ["gas"], label: "Gas suppliers" },
  { id: "cleaning", slugs: ["cleaning"], label: "Cleaning & household services" },
  { id: "hair", slugs: ["hair-beauty"], label: "Hairdressers & barbers" },
  { id: "building", slugs: ["construction", "metalwork-welding"], label: "Building & construction" },
  { id: "food", slugs: ["food-shops"], label: "Food & catering" },
  { id: "other", slugs: ["other"], label: "Local services near you" },
];

/** Max distinct listings in one intro (one work photo each; hero is separate). */
export const CATEGORY_FLASH_MAX_LISTINGS = 12;

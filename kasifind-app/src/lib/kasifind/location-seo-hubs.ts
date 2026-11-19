export type SeoLocationHub = {
  slug: string;
  name: string;
  /** Matched against the public listing locationLabel (case-insensitive contains). */
  locationLabelMatch: string;
  province: string;
};

/** Curated indexable areas — only uses data already shown on listings as locationLabel. */
export const SEO_LOCATION_HUBS: readonly SeoLocationHub[] = [
  { slug: "johannesburg", name: "Johannesburg", locationLabelMatch: "Johannesburg", province: "Gauteng" },
  { slug: "soweto", name: "Soweto", locationLabelMatch: "Soweto", province: "Gauteng" },
  { slug: "pretoria", name: "Pretoria", locationLabelMatch: "Pretoria", province: "Gauteng" },
  { slug: "centurion", name: "Centurion", locationLabelMatch: "Centurion", province: "Gauteng" },
  { slug: "sandton", name: "Sandton", locationLabelMatch: "Sandton", province: "Gauteng" },
  { slug: "midrand", name: "Midrand", locationLabelMatch: "Midrand", province: "Gauteng" },
  { slug: "roodepoort", name: "Roodepoort", locationLabelMatch: "Roodepoort", province: "Gauteng" },
  { slug: "randburg", name: "Randburg", locationLabelMatch: "Randburg", province: "Gauteng" },
  { slug: "cape-town", name: "Cape Town", locationLabelMatch: "Cape Town", province: "Western Cape" },
  { slug: "durban", name: "Durban", locationLabelMatch: "Durban", province: "KwaZulu-Natal" },
  { slug: "pietermaritzburg", name: "Pietermaritzburg", locationLabelMatch: "Pietermaritzburg", province: "KwaZulu-Natal" },
  { slug: "gqeberha", name: "Gqeberha", locationLabelMatch: "Gqeberha", province: "Eastern Cape" },
  { slug: "port-elizabeth", name: "Port Elizabeth", locationLabelMatch: "Port Elizabeth", province: "Eastern Cape" },
  { slug: "bloemfontein", name: "Bloemfontein", locationLabelMatch: "Bloemfontein", province: "Free State" },
  { slug: "polokwane", name: "Polokwane", locationLabelMatch: "Polokwane", province: "Limpopo" },
  { slug: "rustenburg", name: "Rustenburg", locationLabelMatch: "Rustenburg", province: "North West" },
  { slug: "nelspruit", name: "Nelspruit", locationLabelMatch: "Nelspruit", province: "Mpumalanga" },
  { slug: "kimberley", name: "Kimberley", locationLabelMatch: "Kimberley", province: "Northern Cape" },
];

export function getSeoLocationHub(slug: string): SeoLocationHub | undefined {
  return SEO_LOCATION_HUBS.find((hub) => hub.slug === slug);
}

export function locationHubBrowseDescription(hub: SeoLocationHub): string {
  return `Find local businesses and service providers near ${hub.name}, ${hub.province} on KasiFind.`;
}
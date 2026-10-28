export type KfSearchResult = {
  id: string;
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  profileImageUrl: string | null;
  priceHint: string | null;
  distanceKm: number;
  categories: { slug: string; name: string }[];
  services: { name: string }[];
  photoUrls: string[];
  averageRating: number | null;
  reviewCount: number;
};

export type KfCategory = {
  id: string;
  slug: string;
  name: string;
  children: { id: string; slug: string; name: string }[];
};

export function categoryPublicPath(slug: string): string {
  return `/categories/${slug}`;
}

export function categoryBrowseDescription(categoryName: string): string {
  return `Find trusted ${categoryName} businesses and local service providers across South Africa on KasiFind.`;
}
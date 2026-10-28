import type { LucideIcon } from "lucide-react";
import {
  Car,
  Flame,
  Grid2X2,
  Hammer,
  Home,
  Layers,
  Scissors,
  Shield,
  ShoppingBag,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

const SLUG_ICON: Record<string, LucideIcon> = {
  "metalwork-welding": Hammer,
  "gates-security": Shield,
  "aluminium-windows": Layers,
  automotive: Car,
  plumbing: Wrench,
  electrical: Zap,
  construction: Home,
  gas: Flame,
  "hair-beauty": Scissors,
  cleaning: Sparkles,
  "food-shops": ShoppingBag,
  other: Grid2X2,
};

export function categoryIconForSlug(slug: string): LucideIcon {
  return SLUG_ICON[slug] ?? Grid2X2;
}

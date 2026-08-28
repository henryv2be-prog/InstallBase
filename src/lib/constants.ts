export const SPECIALTIES = [
  "CCTV",
  "Access Control",
  "Alarms",
  "Gate Automation",
  "Networking",
  "Intercoms",
  "Electrician",
  "Solar",
  "Other",
] as const;

export const BRAG_CATEGORIES = [
  "Best CCTV Installation",
  "Best Access Control",
  "Best Cable Management",
  "Best Rack",
  "Biggest Installation",
  "Most Creative Solution",
  "Best Before & After",
  "Best Small Installation",
] as const;

export const DEMO_PASSWORD = "InstallBase123!";

/** Stable demo image URLs — verified working on Unsplash */
export const DEMO_IMAGES = {
  cctv: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  rack: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
  cable: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  camera: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
  install: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  security: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  network: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  access: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
} as const;

export const INSTALLER_IMAGES = Object.values(DEMO_IMAGES);

/** Old broken URLs → replacements (for db:fix-images) */
export const BROKEN_IMAGE_REPLACEMENTS: Record<string, string> = {
  "https://images.unsplash.com/photo-1518432031352-6bfc06f6f9b2?w=800&q=80": DEMO_IMAGES.install,
  "https://images.unsplash.com/photo-1558002038-1051097dfe05?w=800&q=80": DEMO_IMAGES.security,
  "https://images.unsplash.com/photo-1557597774-711272814770?w=800&q=80": DEMO_IMAGES.access,
  "https://images.unsplash.com/photo-1597852078576-b6717843a0d8?w=800&q=80": DEMO_IMAGES.network,
};

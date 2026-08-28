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

function unsplash(id: string, w = 1400) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Verified Unsplash installs — CCTV, access, racks, solar, sparkies */
export const TRADE_PHOTOS = {
  cctvBosch: unsplash("photo-1566060475410-1159300f046f"),
  cctvCommercial: unsplash("photo-1765121689322-6befc57dc8db"),
  cctvOutdoor: unsplash("photo-1677863760717-eec0ac3b911a"),
  cctvIndustrial: unsplash("photo-1746240199540-9a68fc1b87e7"),
  accessReader: unsplash("photo-1754494977436-a5c202306fe4"),
  networkPatch: unsplash("photo-1680691257251-5fead813b73e"),
  networkRack: unsplash("photo-1558494949-ef010cbdcc31"),
  solarSunset: unsplash("photo-1613665813446-82a78c468a1d"),
  solarField: unsplash("photo-1509391366360-2e959784a276"),
  solarRoof: unsplash("photo-1745187946672-2c1d8cf26a2b"),
  electrician: unsplash("photo-1621905251918-48416bd8575a"),
} as const;

/** Stable demo image URLs used by seed data */
export const DEMO_IMAGES = {
  cctv: TRADE_PHOTOS.cctvCommercial,
  rack: TRADE_PHOTOS.networkRack,
  cable: TRADE_PHOTOS.networkPatch,
  camera: TRADE_PHOTOS.cctvBosch,
  install: TRADE_PHOTOS.electrician,
  security: TRADE_PHOTOS.accessReader,
  network: TRADE_PHOTOS.networkRack,
  access: TRADE_PHOTOS.accessReader,
} as const;

export const LANDING_HERO = [
  {
    src: TRADE_PHOTOS.cctvBosch,
    label: "CCTV",
    alt: "Rows of Bosch bullet cameras mounted on a commercial wall",
    className: "col-span-2 aspect-[2/1] min-h-[200px] sm:min-h-[240px]",
    sizes: "(max-width: 1024px) 100vw, 50vw",
    priority: true,
  },
  {
    src: TRADE_PHOTOS.accessReader,
    label: "Access Control",
    alt: "Access card reader installed on a concrete stairwell wall",
    className: "aspect-[4/3]",
    sizes: "(max-width: 1024px) 50vw, 25vw",
    priority: true,
  },
  {
    src: TRADE_PHOTOS.networkPatch,
    label: "Networking",
    alt: "Color-coded ethernet bundles dressed into a rack-mounted switch",
    className: "aspect-[4/3]",
    sizes: "(max-width: 1024px) 50vw, 25vw",
    priority: true,
  },
  {
    src: TRADE_PHOTOS.solarSunset,
    label: "Solar",
    alt: "Commercial rooftop solar array photographed at sunset",
    className: "col-span-2 aspect-[2/1] min-h-[180px]",
    sizes: "(max-width: 1024px) 100vw, 50vw",
  },
] as const;

export const LANDING_GALLERY = [
  {
    src: TRADE_PHOTOS.networkRack,
    label: "Networking",
    alt: "Server racks with dressed fibre and ethernet and active status lights",
    className: "col-span-2 aspect-[16/9] min-h-[180px]",
    sizes: "(max-width: 1024px) 100vw, 66vw",
  },
  {
    src: TRADE_PHOTOS.cctvOutdoor,
    label: "CCTV",
    alt: "Two outdoor bullet cameras on a building corner under a clear sky",
    className: "aspect-[4/3] min-h-[180px] sm:aspect-[3/4]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
  {
    src: TRADE_PHOTOS.electrician,
    label: "Electrician",
    alt: "Electrician working a wall-mounted electrical enclosure",
    className: "aspect-[4/3] min-h-[180px]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
  {
    src: TRADE_PHOTOS.solarField,
    label: "Solar",
    alt: "Ground-mount solar arrays stretching across an open field",
    className: "aspect-[4/3] min-h-[180px]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
  {
    src: TRADE_PHOTOS.cctvCommercial,
    label: "CCTV",
    alt: "Commercial box camera on a ceiling pole mount",
    className: "aspect-[4/3] min-h-[180px]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
  {
    src: TRADE_PHOTOS.cctvIndustrial,
    label: "CCTV",
    alt: "Outdoor camera housing mounted on a rail-side pole against a blue sky",
    className: "aspect-[4/3] min-h-[180px]",
    sizes: "(max-width: 1024px) 50vw, 33vw",
  },
  {
    src: TRADE_PHOTOS.solarRoof,
    label: "Solar",
    alt: "Neat rows of rooftop solar panels on a corrugated roof",
    className: "col-span-2 aspect-[16/9] min-h-[180px]",
    sizes: "(max-width: 1024px) 100vw, 66vw",
  },
] as const;

/** Old broken or generic stock URLs → trade photos (for db:fix-images) */
export const BROKEN_IMAGE_REPLACEMENTS: Record<string, string> = {
  "https://images.unsplash.com/photo-1518432031352-6bfc06f6f9b2?w=800&q=80": DEMO_IMAGES.install,
  "https://images.unsplash.com/photo-1558002038-1051097dfe05?w=800&q=80": DEMO_IMAGES.security,
  "https://images.unsplash.com/photo-1557597774-711272814770?w=800&q=80": DEMO_IMAGES.access,
  "https://images.unsplash.com/photo-1597852078576-b6717843a0d8?w=800&q=80": DEMO_IMAGES.network,
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80": DEMO_IMAGES.cctv,
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80": DEMO_IMAGES.cable,
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80": DEMO_IMAGES.camera,
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80": DEMO_IMAGES.install,
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80": DEMO_IMAGES.security,
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80": DEMO_IMAGES.network,
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80": DEMO_IMAGES.access,
};

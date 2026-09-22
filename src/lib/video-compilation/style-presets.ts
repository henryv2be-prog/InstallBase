/** Shared CapCut-style preset definitions (server ffmpeg + client live preview). */

export type VideoTransitionKind = "cut" | "fade" | "slideleft" | "slideright" | "wipeup";

export type StylePreviewTransition = "cut" | "fade" | "slide-left" | "slide-right" | "zoom-pop";

export type VideoStylePreset = {
  label: string;
  description: string;
  category: "Motion" | "Slide" | "Filter";
  photoDurationSec: number;
  zoom: boolean;
  zoomStrength: "normal" | "strong";
  landscapeBlur: boolean;
  transition: VideoTransitionKind;
  transitionSec: number;
  /** Appended to ffmpeg -vf (comma-separated chain). */
  ffmpegColorFilter?: string;
  preview: {
    cssFilter: string;
    kenBurns: boolean;
    kenBurnsIntensity?: "normal" | "strong";
    transition: StylePreviewTransition;
    /** Slide/fade length in ms (live preview). */
    transitionMs: number;
  };
};

export const VIDEO_COMPILATION_STYLES = {
  cinematic: {
    label: "Cinematic",
    description: "Slow zoom, soft fades",
    category: "Motion",
    photoDurationSec: 3.5,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.45,
    preview: {
      cssFilter: "contrast(1.05) saturate(1.08)",
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 450,
    },
  },
  quick_pop: {
    label: "Quick pop",
    description: "Fast cuts, punchy colors",
    category: "Motion",
    photoDurationSec: 1.8,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "cut",
    transitionSec: 0,
    ffmpegColorFilter: "eq=contrast=1.12:saturation=1.18",
    preview: {
      cssFilter: "contrast(1.12) saturate(1.2)",
      kenBurns: false,
      transition: "cut",
      transitionMs: 80,
    },
  },
  smooth_fade: {
    label: "Smooth fade",
    description: "CapCut-style crossfades",
    category: "Slide",
    photoDurationSec: 3,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.55,
    preview: {
      cssFilter: "brightness(1.03)",
      kenBurns: false,
      transition: "fade",
      transitionMs: 550,
    },
  },
  slide_left: {
    label: "Slide left",
    description: "Swipe to the next shot",
    category: "Slide",
    photoDurationSec: 2.5,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "slideleft",
    transitionSec: 0.4,
    preview: {
      cssFilter: "none",
      kenBurns: false,
      transition: "slide-left",
      transitionMs: 400,
    },
  },
  slide_right: {
    label: "Slide right",
    description: "Reverse swipe transition",
    category: "Slide",
    photoDurationSec: 2.5,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "slideright",
    transitionSec: 0.4,
    preview: {
      cssFilter: "none",
      kenBurns: false,
      transition: "slide-right",
      transitionMs: 400,
    },
  },
  zoom_punch: {
    label: "Zoom punch",
    description: "Snap zoom between photos",
    category: "Motion",
    photoDurationSec: 2.2,
    zoom: true,
    zoomStrength: "strong",
    landscapeBlur: false,
    transition: "fade",
    transitionSec: 0.25,
    preview: {
      cssFilter: "contrast(1.08)",
      kenBurns: true,
      kenBurnsIntensity: "strong",
      transition: "zoom-pop",
      transitionMs: 280,
    },
  },
  warm_install: {
    label: "Warm install",
    description: "Golden, trade-show glow",
    category: "Filter",
    photoDurationSec: 3,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.35,
    ffmpegColorFilter: "eq=saturation=1.12:brightness=0.04:gamma=1.06",
    preview: {
      cssFilter: "sepia(0.12) saturate(1.15) brightness(1.05) hue-rotate(-8deg)",
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 350,
    },
  },
  cool_tech: {
    label: "Cool tech",
    description: "Blue CCTV / tech look",
    category: "Filter",
    photoDurationSec: 2.8,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "wipeup",
    transitionSec: 0.35,
    ffmpegColorFilter: "eq=saturation=0.85:brightness=-0.02:contrast=1.05,curves=b='0/0 0.5/0.48 1/1'",
    preview: {
      cssFilter: "saturate(0.85) contrast(1.05) brightness(0.95) hue-rotate(12deg)",
      kenBurns: false,
      transition: "fade",
      transitionMs: 320,
    },
  },
  vintage_reel: {
    label: "Vintage reel",
    description: "Muted film-style grade",
    category: "Filter",
    photoDurationSec: 3.2,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.5,
    ffmpegColorFilter: "eq=saturation=0.75:contrast=1.08:gamma=1.05",
    preview: {
      cssFilter: "sepia(0.35) contrast(1.08) saturate(0.75)",
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 500,
    },
  },
  flash_montage: {
    label: "Flash montage",
    description: "Ultra-fast hype cuts",
    category: "Motion",
    photoDurationSec: 1.4,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: false,
    transition: "cut",
    transitionSec: 0,
    ffmpegColorFilter: "eq=contrast=1.2:saturation=1.25",
    preview: {
      cssFilter: "contrast(1.18) saturate(1.22)",
      kenBurns: false,
      transition: "cut",
      transitionMs: 60,
    },
  },
  /** Legacy ids kept for older drafts */
  quick: {
    label: "Quick cuts",
    description: "Faster pacing (legacy)",
    category: "Motion",
    photoDurationSec: 2,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "cut",
    transitionSec: 0,
    preview: {
      cssFilter: "none",
      kenBurns: false,
      transition: "cut",
      transitionMs: 80,
    },
  },
  steady: {
    label: "Steady hold",
    description: "Longer on each photo (legacy)",
    category: "Motion",
    photoDurationSec: 5,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.4,
    preview: {
      cssFilter: "none",
      kenBurns: false,
      transition: "fade",
      transitionMs: 400,
    },
  },
  dramatic: {
    label: "Dramatic zoom",
    description: "Strong zoom (legacy)",
    category: "Motion",
    photoDurationSec: 4,
    zoom: true,
    zoomStrength: "strong",
    landscapeBlur: false,
    transition: "fade",
    transitionSec: 0.35,
    preview: {
      cssFilter: "contrast(1.1)",
      kenBurns: true,
      kenBurnsIntensity: "strong",
      transition: "fade",
      transitionMs: 350,
    },
  },
} as const satisfies Record<string, VideoStylePreset>;

export type VideoCompilationStyleId = keyof typeof VIDEO_COMPILATION_STYLES;

/** Video style presets (server ffmpeg + client live preview). */

export type VideoTransitionKind = "cut" | "fade" | "slideleft" | "slideright" | "wipeup";

export type StylePreviewTransition =
  | "cut"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "zoom-pop"
  | "wipe-up";

export type VideoStylePreset = {
  label: string;
  description: string;
  category: "Motion" | "Slide";
  photoDurationSec: number;
  zoom: boolean;
  zoomStrength: "normal" | "strong";
  landscapeBlur: boolean;
  transition: VideoTransitionKind;
  transitionSec: number;
  preview: {
    kenBurns: boolean;
    kenBurnsIntensity?: "normal" | "strong";
    transition: StylePreviewTransition;
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
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 450,
    },
  },
  quick_pop: {
    label: "Quick pop",
    description: "Fast cuts, high energy",
    category: "Motion",
    photoDurationSec: 1.8,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "cut",
    transitionSec: 0,
    preview: {
      kenBurns: false,
      transition: "cut",
      transitionMs: 80,
    },
  },
  smooth_fade: {
    label: "Smooth fade",
    description: "Gentle crossfades between photos",
    category: "Slide",
    photoDurationSec: 3,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.55,
    preview: {
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
      kenBurns: true,
      kenBurnsIntensity: "strong",
      transition: "zoom-pop",
      transitionMs: 280,
    },
  },
  flash_montage: {
    label: "Flash montage",
    description: "Ultra-fast cuts",
    category: "Motion",
    photoDurationSec: 1.4,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: false,
    transition: "cut",
    transitionSec: 0,
    preview: {
      kenBurns: false,
      transition: "cut",
      transitionMs: 60,
    },
  },
  wipe_up: {
    label: "Wipe up",
    description: "Reveal next shot upward",
    category: "Slide",
    photoDurationSec: 2.8,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "wipeup",
    transitionSec: 0.45,
    preview: {
      kenBurns: false,
      transition: "wipe-up",
      transitionMs: 450,
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
      kenBurns: false,
      transition: "cut",
      transitionMs: 80,
    },
  },
  steady: {
    label: "Slow hold",
    description: "Linger on each photo",
    category: "Motion",
    photoDurationSec: 5,
    zoom: false,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.4,
    preview: {
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
      kenBurns: true,
      kenBurnsIntensity: "strong",
      transition: "fade",
      transitionMs: 350,
    },
  },
  /** Removed filter styles — map to cinematic when loading old drafts */
  warm_install: {
    label: "Cinematic",
    description: "Legacy style",
    category: "Motion",
    photoDurationSec: 3.5,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.45,
    preview: {
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 450,
    },
  },
  cool_tech: {
    label: "Cinematic",
    description: "Legacy style",
    category: "Motion",
    photoDurationSec: 3.5,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.45,
    preview: {
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 450,
    },
  },
  vintage_reel: {
    label: "Cinematic",
    description: "Legacy style",
    category: "Motion",
    photoDurationSec: 3.5,
    zoom: true,
    zoomStrength: "normal",
    landscapeBlur: true,
    transition: "fade",
    transitionSec: 0.45,
    preview: {
      kenBurns: true,
      kenBurnsIntensity: "normal",
      transition: "fade",
      transitionMs: 450,
    },
  },
} as const satisfies Record<string, VideoStylePreset>;

export type VideoCompilationStyleId = keyof typeof VIDEO_COMPILATION_STYLES;

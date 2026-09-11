import { cn } from "@/lib/utils";

/** Square-ish canvas matching the reference mark proportions. */
export const IB_MARK_VIEWBOX = "0 0 50 46";

/** Cyan accent for the full i (dot + stem), like the orange i in the reference. */
export const IB_MARK_ACCENT = "#67e8f9";

/** Default in-app mark scale inside the blue rounded square. */
export const IB_MARK_BOX_CLASS = "h-[72%] w-[72%]";

export const I_DOT = { cx: 10, cy: 8, r: 4.5 };
export const I_STEM = { x: 6.25, y: 15.5, w: 7.5, h: 28.5, rx: 3.75 };

/** Upward spur where the top bowl meets the shared stem. */
export const B_SPUR = "M13.75 15.5L13.75 10.8L15.8 8.2L15.8 15.5Z";

/** Top and bottom bowls attach directly to the i stem spine at x=13.75. */
export const B_TOP_BOWL =
  "M13.75 15.5H19.2C34.8 15.5 40.2 18.4 40.2 22.8C40.2 27.2 34.8 29.8 19.2 29.8H13.75V15.5Z";

export const B_BOTTOM_BOWL =
  "M13.75 29.8H20.8C36.2 29.8 40.8 33 40.8 37.8C40.8 42.6 35.6 44.5 20.8 44.5H13.75V29.8Z";

export const B_TOP_COUNTER =
  "M20.8 18.6H35.2C37.4 18.6 38.6 19.9 38.6 22.2C38.6 24.8 36.8 26.2 34.2 26.2H20.8V18.6Z";

export const B_BOTTOM_COUNTER =
  "M20.8 32.8H34.2C36.8 32.8 38.2 34.5 38.2 37.2C38.2 40 36.2 41.6 33.2 41.6H20.8V32.8Z";

export const B_PATH = `${B_SPUR} ${B_TOP_BOWL} ${B_BOTTOM_BOWL}`;
export const B_PATH_D = `${B_PATH} ${B_TOP_COUNTER} ${B_BOTTOM_COUNTER}`;

interface IbMarkProps {
  className?: string;
  /** White silhouette for notification badges on transparent backgrounds. */
  monochrome?: boolean;
}

/**
 * Stylized iB monogram matching the reference geometry: accent i (dot + stem)
 * with white B bowls attached to the stem.
 */
export function IbMark({ className, monochrome = false }: IbMarkProps) {
  const accentColor = monochrome ? "currentColor" : IB_MARK_ACCENT;
  const bColor = "currentColor";

  return (
    <svg
      viewBox={IB_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      <circle cx={I_DOT.cx} cy={I_DOT.cy} r={I_DOT.r} fill={accentColor} />
      <rect
        x={I_STEM.x}
        y={I_STEM.y}
        width={I_STEM.w}
        height={I_STEM.h}
        rx={I_STEM.rx}
        fill={accentColor}
      />
      <path fill={bColor} fillRule={monochrome ? "nonzero" : "evenodd"} d={monochrome ? B_PATH : B_PATH_D} />
    </svg>
  );
}

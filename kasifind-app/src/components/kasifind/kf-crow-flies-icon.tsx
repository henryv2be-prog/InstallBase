type Props = {
  className?: string;
};

/**
 * Flying crow silhouette (beak right, tail left) — angular wings readable at ~1rem.
 */
export function KfCrowFliesIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 14"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M1 9.2 5.2 8 9 8.8 12.2 5.8 15.8 7.6 21 4.2 27 6.2 32.2 4.8 35 6.2 34.2 9 29.8 9.6 24.5 10.2 19 10.6 13.2 10.8 8 10.4 4 10.8 1 9.2z" />
    </svg>
  );
}
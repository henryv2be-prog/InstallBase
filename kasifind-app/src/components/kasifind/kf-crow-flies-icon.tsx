type Props = {
  className?: string;
};

/**
 * Flying crow — raised wings, hooked beak, fanned tail (inspired by reference silhouette).
 */
export function KfCrowFliesIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 36"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M 2 27 4.5 25.5 5.5 22.5 7 24 8.5 20 10.5 16 13 12 15.5 8.5 18 6 20.5 8 22.5 11 24.5 9.5 26.5 12 28.5 11 30 13.5 29.5 16 28.5 18 31 20.5 30.5 18.5 34 17 36 19.5 38 18 35.5 17.5 32.5 28 29.5 32 30.5 35.5 32.5 35 34.5 32.5 35 29.5 35 22 35 15 34 9 32 5 30 3 27
          M 32.5 31.5 a 1.4 1.4 0 1 0 0.01 0
        "
      />
    </svg>
  );
}
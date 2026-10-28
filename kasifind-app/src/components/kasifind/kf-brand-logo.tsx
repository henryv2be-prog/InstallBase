/** Distinctive location-pin mark — readable from 16px upward. */
export function KfBrandLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M16 3c-5.2 0-9.5 4-9.5 9.1 0 6.8 7.2 13.2 9.1 15.1.4.4 1 .4 1.4 0 1.9-1.9 9.1-8.3 9.1-15.1C26.1 7 21.8 3 16 3Z"
        fill="currentColor"
      />
      <circle cx="16" cy="12.2" r="4.2" fill="#F6C945" />
      <circle cx="16" cy="12.2" r="1.6" fill="#0F4D3A" />
    </svg>
  );
}

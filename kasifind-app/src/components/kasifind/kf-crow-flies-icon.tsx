type Props = {
  className?: string;
};

/** Small flying crow silhouette — straight-line distance (as the crow flies). */
export function KfCrowFliesIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 12"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M2.2 6.4c1.1-1.4 2.6-2.3 4.3-2.6.5-.1 1-.15 1.5-.1.8.1 1.5.4 2.2.8l.3-.5c.2-.3.5-.6.9-.7.4-.1.8 0 1.1.2.3.2.5.6.5 1v.4l.7-.2c.6-.2 1.2-.2 1.8 0 .5.2.9.5 1.2.9.2.3.2.7.1 1-.3.5-.8.8-1.3 1l-1.1.3c-.4.6-.9 1.1-1.5 1.5-.9.6-2 .9-3.1.9-1.6 0-3.1-.5-4.3-1.4-1-.7-1.6-1.6-1.9-2.6-.1-.4 0-.8.2-1.2zM5.8 4.6c-.9.2-1.7.7-2.4 1.4 1.1-.3 2.2-.3 3.3.1.6.2 1.1.5 1.6.9-.5-.8-1.3-1.3-2.3-1.5-.4-.1-.8-.1-1.2 0zM14.8 5.8c.4-.1.8 0 1.1.2-.5 0-1 .1-1.5.3-.5.2-1 .5-1.4.9.1-.5.4-.9.8-1.4z" />
    </svg>
  );
}
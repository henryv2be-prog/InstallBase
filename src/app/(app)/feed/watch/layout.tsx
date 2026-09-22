/** Ensures the flex height chain is intact on first paint (mobile New look Home). */
export default function FeedWatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="immersive-viewport-page flex min-h-0 w-full flex-1 flex-col">{children}</div>
  );
}

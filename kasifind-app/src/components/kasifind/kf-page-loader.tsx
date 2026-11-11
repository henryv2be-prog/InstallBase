import Link from "next/link";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";

type Props = {
  message?: string;
  withSkeleton?: boolean;
};

export function KfPageLoader({
  message = "Loading…",
  withSkeleton = true,
}: Props) {
  return (
    <div className="kf-page-loader" role="status" aria-live="polite" aria-busy="true">
      <p className="sr-only">{message}</p>
      <div className="kf-page-loader-mark kf-animate-in">
        <span className="kf-page-loader-ring" aria-hidden />
        <span className="kf-page-loader-pin" aria-hidden>
          <KfBrandLogo className="h-9 w-9 text-[var(--kf-forest)]" />
        </span>
        <p className="kf-page-loader-wordmark">
          Kasi<span className="kf-text-gradient">Find</span>
        </p>
        <p className="kf-page-loader-message" aria-hidden>
          {message}
        </p>
      </div>
      {withSkeleton ? (
        <div className="kf-page-loader-skeleton kf-animate-in" aria-hidden>
          <div className="kf-skeleton h-28 w-full rounded-2xl" />
          <div className="kf-skeleton h-4 w-2/3 max-w-xs" />
          <div className="kf-skeleton h-4 w-full max-w-md" />
          <div className="kf-skeleton h-4 w-5/6 max-w-sm" />
        </div>
      ) : null}
    </div>
  );
}

export function KfHeaderLoaderFallback() {
  return (
    <header className="kf-header">
      <div className="mx-auto max-w-5xl kf-header-inner">
        <Link href="/" className="kf-brand">
          <span className="kf-brand-mark" aria-hidden>
            <KfBrandLogo className="h-8 w-8 text-[var(--kf-forest)]" />
          </span>
          <div className="min-w-0">
            <div className="kf-wordmark">
              Kasi<span className="kf-text-gradient">Find</span>
            </div>
          </div>
        </Link>
        <LoadingDots />
      </div>
    </header>
  );
}

function LoadingDots() {
  return (
    <div className="kf-header-loading-dots" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

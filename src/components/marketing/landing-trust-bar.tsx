import { formatNumber } from "@/lib/utils";

export type LandingCommunityStats = {
  installersSharing: number;
  installsThisWeek: number;
  questionsAnswered: number;
  totalBragPoints: number;
};

interface LandingTrustBarProps {
  stats: LandingCommunityStats;
}

export function LandingTrustBar({ stats }: LandingTrustBarProps) {
  const items = [
    stats.installersSharing > 0
      ? {
          value: formatNumber(stats.installersSharing),
          label: "installers sharing work",
        }
      : null,
    stats.installsThisWeek > 0
      ? {
          value: formatNumber(stats.installsThisWeek),
          label: "installs posted this week",
        }
      : null,
    stats.questionsAnswered > 0
      ? {
          value: formatNumber(stats.questionsAnswered),
          label: "questions answered",
        }
      : null,
    stats.totalBragPoints > 0
      ? {
          value: formatNumber(stats.totalBragPoints),
          label: "brag points given",
        }
      : null,
  ].filter(Boolean) as { value: string; label: string }[];

  if (items.length === 0) {
    return (
      <div className="border-b border-border bg-card/30 py-5">
        <p className="text-center text-sm text-muted">
          A growing community of CCTV, access, alarms, networking and electrical installers.
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card/30 py-5 sm:py-6">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-center lg:px-6">
        {items.map((item) => (
          <div key={item.label} className="min-w-[7rem]">
            <p className="text-xl font-extrabold tracking-tight sm:text-2xl">{item.value}</p>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

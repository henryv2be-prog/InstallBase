import { auth } from "@/lib/auth";
import { getJobs } from "@/lib/queries";
import { MapPin, Clock } from "lucide-react";
import { RelativeTime } from "@/components/ui/relative-time";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/ads/ad-slot";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";

export const metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="text-muted">
          Installer opportunities — full marketplace coming soon
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
        🚧 The InstallBase jobs marketplace is under development. These are sample listings
        to show how hiring and subcontracting will work.
      </div>

      <AdSlot placement={AD_PLACEMENTS.JOB} className="mb-6" />

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{job.title}</h3>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> <RelativeTime date={job.createdAt} />
                  </span>
                </div>
              </div>
              {job.category && <Badge variant="secondary">{job.category}</Badge>}
            </div>
            <p className="mt-3 text-foreground/80">{job.description}</p>
            {job.requirements && (
              <p className="mt-2 text-sm text-muted">
                <strong>Requirements:</strong> {job.requirements}
              </p>
            )}
            <button
              disabled
              className="mt-4 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-400 dark:bg-gray-800"
            >
              Apply — Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

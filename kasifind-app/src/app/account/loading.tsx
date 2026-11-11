import { KfPageLoader } from "@/components/kasifind/kf-page-loader";

export default function AccountLoading() {
  return <KfPageLoader message="Loading your dashboard…" withSkeleton={false} />;
}

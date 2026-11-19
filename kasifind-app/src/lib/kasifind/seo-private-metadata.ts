import type { Metadata } from "next";

/** Keep admin, auth, and provider account areas out of search indexes. */
export const KF_PRIVATE_ROUTE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};
"use client";

import type { KfSearchResult } from "@/components/kasifind/types";
import { KfProviderCard } from "@/components/kasifind/kf-provider-card";

const EXAMPLES_SCOPE = "list-your-business-examples";

type Props = {
  examples: KfSearchResult[];
};

export function KfListYourBusinessExamples({ examples }: Props) {
  if (examples.length === 0) {
    return (
      <p className="kf-section-sub mt-3">
        Approved local listings appear here as soon as they are published on KasiFind.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2" aria-label="Example published listings">
      {examples.map((provider, index) => (
        <KfProviderCard
          key={provider.id}
          provider={provider}
          serviceHint={provider.services[0]?.name ?? provider.categories[0]?.name ?? "Local services"}
          index={index}
          impressionScopeKey={EXAMPLES_SCOPE}
        />
      ))}
    </ul>
  );
}
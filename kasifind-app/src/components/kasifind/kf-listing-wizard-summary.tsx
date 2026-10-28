"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

type Summary = {
  displayName: string;
  locationLabel: string;
  phone: string;
  categoryCount: number;
  serviceLines: number;
  photoCount: number;
  hasProfilePhoto: boolean;
};

function readSummary(form: HTMLFormElement, photoCount: number, hasProfilePhoto: boolean): Summary {
  const fd = new FormData(form);
  const services = String(fd.get("services") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    displayName: String(fd.get("displayName") ?? "").trim() || "—",
    locationLabel: String(fd.get("locationLabel") ?? "").trim() || "—",
    phone: String(fd.get("phone") ?? "").trim() || "—",
    categoryCount: form.querySelectorAll('input[name="categoryId"]:checked').length,
    serviceLines: services.length,
    photoCount,
    hasProfilePhoto,
  };
}

export function KfListingWizardSummary({
  formRef,
  photoCount,
  hasProfilePhoto,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  photoCount: number;
  hasProfilePhoto: boolean;
}) {
  const [summary, setSummary] = useState<Summary | null>(null);

  const refresh = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    setSummary(readSummary(form, photoCount, hasProfilePhoto));
  }, [formRef, photoCount, hasProfilePhoto]);

  useEffect(() => {
    refresh();
    const form = formRef.current;
    if (!form) return;
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    return () => {
      form.removeEventListener("input", refresh);
      form.removeEventListener("change", refresh);
    };
  }, [formRef, refresh]);

  if (!summary) return null;

  return (
    <dl className="kf-wizard-summary">
      <div>
        <dt>Business</dt>
        <dd>{summary.displayName}</dd>
      </div>
      <div>
        <dt>Area</dt>
        <dd>{summary.locationLabel}</dd>
      </div>
      <div>
        <dt>Contact</dt>
        <dd>{summary.phone}</dd>
      </div>
      <div>
        <dt>Categories</dt>
        <dd>{summary.categoryCount} selected</dd>
      </div>
      <div>
        <dt>Services listed</dt>
        <dd>{summary.serviceLines}</dd>
      </div>
      <div>
        <dt>Photos</dt>
        <dd>
          {summary.photoCount} work photo{summary.photoCount === 1 ? "" : "s"}
          {summary.hasProfilePhoto ? " · business photo added" : " · no business photo yet"}
        </dd>
      </div>
      {summary.photoCount === 0 && !summary.hasProfilePhoto ? (
        <p className="kf-wizard-summary-tip">
          Tip: Adding at least one photo helps customers trust your work — you can still publish and
          add photos later.
        </p>
      ) : null}
    </dl>
  );
}

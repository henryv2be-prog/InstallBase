"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { formatRelativeTime } from "@/lib/utils";

interface RelativeTimeProps {
  date: Date | string;
  className?: string;
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const parsed = new Date(date);
  const stableLabel = format(parsed, "d MMM yyyy");
  const [label, setLabel] = useState(stableLabel);

  useEffect(() => {
    setLabel(formatRelativeTime(parsed));
    const interval = setInterval(() => {
      setLabel(formatRelativeTime(parsed));
    }, 60_000);
    return () => clearInterval(interval);
  }, [parsed.getTime()]);

  return <span className={className}>{label}</span>;
}

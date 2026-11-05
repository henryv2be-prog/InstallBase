import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function KfLegalPageShell({ title, children }: Props) {
  return (
    <article className="kf-legal-page kf-animate-in">
      <Link href="/" className="kf-link inline-flex text-sm underline">
        ← Back to KasiFind
      </Link>
      <h1 className="kf-legal-title mt-4">{title}</h1>
      <div className="kf-legal-prose mt-6">{children}</div>
    </article>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center animate-fade-in">
      <p className="text-6xl font-bold text-muted">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">This page doesn&apos;t exist or may have been moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/feed">Go to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/discover">Explore</Link>
        </Button>
      </div>
    </div>
  );
}

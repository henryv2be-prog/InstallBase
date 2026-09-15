import { LandingPostPreview, LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";

/** Stacked InstallBase-style post cards — no stock slideshow. */
export function LandingHeroPreview() {
  const featured = LANDING_EXAMPLE_POSTS[0];
  const secondary = LANDING_EXAMPLE_POSTS[2];
  const question = LANDING_EXAMPLE_POSTS[5];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative min-h-[420px] sm:min-h-[460px] lg:min-h-[520px]">
        <div className="absolute left-0 top-0 z-10 w-[88%] rotate-[-1.5deg] shadow-2xl shadow-black/20 sm:w-[78%]">
          <LandingPostPreview post={featured} />
        </div>

        <div className="absolute right-0 top-8 z-20 w-[72%] rotate-[1.5deg] shadow-xl shadow-black/15 sm:top-10 sm:w-[62%]">
          <LandingPostPreview post={secondary} compact />
        </div>

        <div className="absolute bottom-0 left-[8%] z-30 w-[80%] shadow-2xl shadow-black/25 sm:left-[12%] sm:w-[70%]">
          <LandingPostPreview post={question} compact />
        </div>
      </div>
    </div>
  );
}

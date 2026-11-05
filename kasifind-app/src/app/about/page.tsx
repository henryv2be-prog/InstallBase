import type { Metadata } from "next";
import { KfLegalPageShell } from "@/components/kasifind/kf-legal-page-shell";

export const metadata: Metadata = {
  title: "About KasiFind",
  description:
    "Learn what KasiFind is, who operates this South African local business discovery platform, and why it exists.",
};

export default function AboutPage() {
  return (
    <KfLegalPageShell title="About KasiFind">
      <p>
        KasiFind is a South African local business discovery platform designed to help communities find
        local businesses, independent service providers and small entrepreneurs in their area.
      </p>
      <p>
        The idea behind KasiFind came from seeing how many talented people operate small businesses from
        their homes, workshops and local communities but struggle to get visibility beyond word of mouth
        and traditional advertising.
      </p>
      <p>
        Whether someone installs gates, repairs vehicles, supplies gas, makes aluminium windows, cuts hair
        or offers services from home, KasiFind aims to make those businesses easier to discover.
      </p>
      <p className="font-semibold text-[var(--kf-charcoal)]">
        Our goal is simple: connect local people with local businesses.
      </p>

      <h2>Who operates KasiFind?</h2>
      <p>
        KasiFind was founded by Henry Vogel in Horison, Roodepoort, South Africa.
      </p>
      <p>KasiFind currently operates as a sole proprietorship.</p>
      <p>
        We are an independently operated South African platform with a focus on making local business
        discovery accessible, straightforward and affordable.
      </p>

      <h2>Our approach</h2>
      <ul>
        <li>Supporting independent local businesses and entrepreneurs.</li>
        <li>Making it easier for customers to discover nearby services.</li>
        <li>Keeping business listings simple and accessible.</li>
        <li>Helping smaller businesses gain visibility without expensive advertising.</li>
        <li>Building a platform around communities and the people who serve them.</li>
      </ul>

      <p className="kf-legal-closing">
        Local businesses deserve to be found. That&apos;s what KasiFind is here for.
      </p>
    </KfLegalPageShell>
  );
}

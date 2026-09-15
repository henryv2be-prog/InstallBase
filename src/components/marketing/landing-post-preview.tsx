import { MessageCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TRADE_PHOTOS } from "@/lib/constants";

export type LandingExamplePost = {
  id: string;
  trade: string;
  image: string;
  imageAlt: string;
  title?: string;
  content: string;
  type: "work" | "question" | "brag";
};

export const LANDING_EXAMPLE_POSTS: LandingExamplePost[] = [
  {
    id: "cctv",
    trade: "CCTV",
    image: TRADE_PHOTOS.cctvBosch,
    imageAlt: "Commercial CCTV camera installation",
    title: "12-camera warehouse coverage",
    content:
      "Dome cameras on aisle coverage, NVR commissioned and remote viewing tested. Cable dressed along trunking.",
    type: "work",
  },
  {
    id: "access",
    trade: "Access Control",
    image: TRADE_PHOTOS.accessReader,
    imageAlt: "Access control reader installation",
    title: "Door controller commissioned",
    content:
      "Reader, maglock and REX all reporting. Access levels programmed and tested with the client on site.",
    type: "work",
  },
  {
    id: "network",
    trade: "Networking",
    image: TRADE_PHOTOS.networkRack,
    imageAlt: "Network rack with dressed cabling",
    title: "Core switch rack",
    content:
      "Patch panels labelled, fibre uplinks tested, VLANs configured. The kind of rack you would photograph.",
    type: "brag",
  },
  {
    id: "solar",
    trade: "Solar",
    image: TRADE_PHOTOS.solarSunset,
    imageAlt: "Rooftop solar panel installation",
    content:
      "8kW array on corrugated roof. Inverter commissioned, export meter fitted, monitoring app set up for the customer.",
    type: "work",
  },
  {
    id: "gate",
    trade: "Gate Automation",
    image: TRADE_PHOTOS.electrician,
    imageAlt: "Gate automation motor installation",
    content:
      "Sliding gate motor fitted with safety loops and photocells. Programming done — opens on first press now.",
    type: "work",
  },
  {
    id: "question",
    trade: "CCTV",
    image: TRADE_PHOTOS.cctvOutdoor,
    imageAlt: "Outdoor security camera",
    title: "PoE voltage drop over 90m run?",
    content:
      "Running a camera 90m from the switch. 24V passive PoE injector at the near end — will the camera boot reliably?",
    type: "question",
  },
];

interface LandingPostPreviewProps {
  post: LandingExamplePost;
  className?: string;
  compact?: boolean;
}

export function LandingPostPreview({ post, className, compact = false }: LandingPostPreviewProps) {
  const typeBadge =
    post.type === "question"
      ? { label: "Question", variant: "question" as const }
      : post.type === "brag"
        ? { label: "Brag", variant: "brag" as const }
        : null;

  return (
    <article
      className={cn(
        "glass-card glow-border overflow-hidden",
        post.type === "brag" && "border-orange-500/25",
        className
      )}
    >
      <div className={cn("p-4", compact && "p-3")}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/25 to-cyan-500/20 font-mono text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-cyan-400"
            aria-hidden
          >
            {post.trade.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">{post.trade}</p>
            <p className="text-xs text-muted">@{post.trade.toLowerCase().replace(/\s+/g, "")}</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{post.trade}</Badge>
          {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
        </div>

        {post.title && (
          <h3 className={cn("mt-2.5 font-bold text-foreground", compact ? "text-sm" : "text-base")}>
            {post.title}
          </h3>
        )}

        <p className={cn("mt-1.5 text-foreground/80", compact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm")}>
          {post.content}
        </p>

        <div className="mt-3 overflow-hidden rounded-xl bg-slate-900/40 ring-1 ring-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.imageAlt}
            className={cn("w-full object-cover", compact ? "aspect-[16/10]" : "aspect-[4/3]")}
            loading="lazy"
            decoding="async"
          />
        </div>

        {!compact && (
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              Comment
            </span>
            {post.type === "brag" && (
              <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Trophy className="h-3.5 w-3.5" />
                Brag
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

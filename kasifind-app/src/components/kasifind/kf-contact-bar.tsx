import { MessageCircle, Navigation, Phone } from "lucide-react";

type Props = {
  waUrl: string;
  phone: string;
  directionsUrl: string;
};

export function KfContactBar({ waUrl, phone, directionsUrl }: Props) {
  return (
    <div className="kf-sticky-contact grid grid-cols-3 gap-2 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="kf-btn kf-btn-wa px-2 text-xs sm:px-4 sm:text-sm">
        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
        WhatsApp
      </a>
      <a
        href={`tel:${phone.replace(/\s/g, "")}`}
        className="kf-btn kf-btn-outline px-2 text-xs sm:px-4 sm:text-sm"
      >
        <Phone className="h-4 w-4 shrink-0" aria-hidden />
        Call
      </a>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="kf-btn kf-btn-secondary px-2 text-xs sm:px-4 sm:text-sm"
      >
        <Navigation className="h-4 w-4 shrink-0" aria-hidden />
        Directions
      </a>
    </div>
  );
}

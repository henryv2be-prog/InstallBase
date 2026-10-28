import { MessageCircle, Phone } from "lucide-react";

type Props = {
  waUrl: string;
  phone: string;
};

export function KfContactBar({ waUrl, phone }: Props) {
  return (
    <div className="kf-sticky-contact grid grid-cols-2 gap-2 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="kf-btn kf-btn-wa">
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </a>
      <a href={`tel:${phone.replace(/\s/g, "")}`} className="kf-btn kf-btn-outline">
        <Phone className="h-4 w-4" aria-hidden />
        Call
      </a>
    </div>
  );
}

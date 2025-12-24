import { Phone, Mail, MapPin, Utensils, ExternalLink } from "lucide-react";

interface QuickLinksProps {
  phone?: string;
  email?: string;
  address?: string;
  onScrollToMenu?: () => void;
}

export const QuickLinks = ({ phone, email, address, onScrollToMenu }: QuickLinksProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {phone && (
        <a 
          href={`tel:${phone}`} 
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="underline underline-offset-2">{phone}</span>
        </a>
      )}
      
      {onScrollToMenu && (
        <button 
          onClick={onScrollToMenu}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Utensils className="w-4 h-4" />
          <span className="underline underline-offset-2">Menu</span>
        </button>
      )}
      
      {email && (
        <a 
          href={`mailto:${email}`} 
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span className="underline underline-offset-2">Email</span>
        </a>
      )}
      
      {address && (
        <a 
          href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="underline underline-offset-2">Mappa</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

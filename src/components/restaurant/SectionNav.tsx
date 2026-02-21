import { Button } from "@/components/ui/button";
import { FileText, Clock, MapPin, Star, Utensils } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionNavProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
}

export const SectionNav = ({ activeSection, onSectionClick }: SectionNavProps) => {
  const { t } = useLanguage();

  const sections = [
    { id: "panoramica", labelKey: "detail.overview", icon: FileText },
    { id: "orari", labelKey: "detail.hours", icon: Clock },
    { id: "posizione", labelKey: "detail.position", icon: MapPin },
    { id: "menu", labelKey: "detail.menu", icon: Utensils },
    { id: "recensioni", labelKey: "detail.reviews", icon: Star },
  ];

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionClick(section.id)}
                className={`flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary rounded-b-none' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(section.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

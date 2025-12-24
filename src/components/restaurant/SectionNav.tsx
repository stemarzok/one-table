import { Button } from "@/components/ui/button";
import { FileText, Clock, MapPin, Star, Utensils } from "lucide-react";

interface SectionNavProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
}

const sections = [
  { id: "panoramica", label: "Panoramica", icon: FileText },
  { id: "orari", label: "Orari", icon: Clock },
  { id: "posizione", label: "Posizione", icon: MapPin },
  { id: "menu", label: "Menu", icon: Utensils },
  { id: "recensioni", label: "Recensioni", icon: Star },
];

export const SectionNav = ({ activeSection, onSectionClick }: SectionNavProps) => {
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
                {section.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

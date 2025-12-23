import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProfileCompletionProgressProps {
  hasLogo: boolean;
  hasCoverImage: boolean;
  hasDescription: boolean;
  hasOpeningHours: boolean;
  tablesCount: number;
  menuItemsCount: number;
}

interface CheckItem {
  id: string;
  label: string;
  completed: boolean;
}

export const ProfileCompletionProgress = ({
  hasLogo,
  hasCoverImage,
  hasDescription,
  hasOpeningHours,
  tablesCount,
  menuItemsCount,
}: ProfileCompletionProgressProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const items: CheckItem[] = [
    { id: "logo", label: "Logo caricato", completed: hasLogo },
    { id: "cover", label: "Immagine di copertina", completed: hasCoverImage },
    { id: "description", label: "Descrizione aggiunta", completed: hasDescription },
    { id: "hours", label: "Orari di apertura", completed: hasOpeningHours },
    { id: "tables", label: "Almeno 1 tavolo", completed: tablesCount > 0 },
    { id: "menu", label: "Almeno 3 piatti nel menu", completed: menuItemsCount >= 3 },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (percentage === 100) {
    return null; // Non mostrare se tutto completato
  }

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Completamento profilo</span>
                  <span className="text-sm font-semibold text-primary">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            </div>
            <div className="ml-4">
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    item.completed ? "text-primary bg-primary/5" : "text-muted-foreground"
                  }`}
                >
                  {item.completed ? (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

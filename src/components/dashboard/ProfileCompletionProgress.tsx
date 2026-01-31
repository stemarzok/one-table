import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, X, ChevronDown, ChevronUp, ArrowRight, Image, FileText, Clock, Table2, UtensilsCrossed, ImageIcon } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface ProfileCompletionProgressProps {
  hasLogo: boolean;
  hasCoverImage: boolean;
  hasDescription: boolean;
  hasOpeningHours: boolean;
  tablesCount: number;
  menuItemsCount: number;
  onNavigateToTab?: (tab: string) => void;
  onOpenInfoModal?: () => void;
}

interface CheckItem {
  id: string;
  label: string;
  completed: boolean;
  icon: React.ElementType;
  action?: () => void;
  actionLabel?: string;
}

export const ProfileCompletionProgress = ({
  hasLogo,
  hasCoverImage,
  hasDescription,
  hasOpeningHours,
  tablesCount,
  menuItemsCount,
  onNavigateToTab,
  onOpenInfoModal,
}: ProfileCompletionProgressProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const items: CheckItem[] = [
    { 
      id: "logo", 
      label: "Logo caricato", 
      completed: hasLogo,
      icon: Image,
      action: onOpenInfoModal,
      actionLabel: "Carica logo"
    },
    { 
      id: "cover", 
      label: "Immagine di copertina", 
      completed: hasCoverImage,
      icon: ImageIcon,
      action: onOpenInfoModal,
      actionLabel: "Carica copertina"
    },
    { 
      id: "description", 
      label: "Descrizione aggiunta", 
      completed: hasDescription,
      icon: FileText,
      action: onOpenInfoModal,
      actionLabel: "Aggiungi descrizione"
    },
    { 
      id: "hours", 
      label: "Orari di apertura", 
      completed: hasOpeningHours,
      icon: Clock,
      action: onOpenInfoModal,
      actionLabel: "Configura orari"
    },
    { 
      id: "tables", 
      label: "Almeno 1 tavolo", 
      completed: tablesCount > 0,
      icon: Table2,
      action: () => onNavigateToTab?.("tables"),
      actionLabel: "Aggiungi tavolo"
    },
    { 
      id: "menu", 
      label: "Almeno 3 piatti nel menu", 
      completed: menuItemsCount >= 3,
      icon: UtensilsCrossed,
      action: () => onNavigateToTab?.("menu"),
      actionLabel: "Aggiungi piatti"
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  if (percentage === 100) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              {/* Circular progress */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-14 h-14 -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${percentage * 1.51} 151`}
                    className="text-amber-500 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{percentage}%</span>
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-lg">Completa il tuo profilo</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{items.length} passaggi completati
                </p>
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
          <div className="px-5 pb-5 pt-2 border-t border-border/50">
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        item.completed 
                          ? "bg-emerald-500/10 border border-emerald-500/20" 
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        item.completed 
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                          : "bg-background text-muted-foreground"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <span className={`flex-1 text-sm font-medium ${
                        item.completed ? "text-foreground" : "text-foreground"
                      }`}>
                        {item.label}
                      </span>
                    
                    {item.completed ? (
                      <div className="p-1 rounded-full bg-emerald-500 text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : item.action ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          item.action?.();
                        }}
                        className="hover:bg-muted transition-all duration-200 gap-1"
                      >
                        {item.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

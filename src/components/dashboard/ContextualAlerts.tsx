import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Image, UtensilsCrossed, Table2, Crown, CheckCircle2 } from "lucide-react";

interface ContextualAlertsProps {
  pendingBookings: number;
  tables: number;
  menuItems: number;
  hasLogo: boolean;
  hasDescription: boolean;
  hasOpeningHours: boolean;
  inTrial: boolean;
  trialDaysRemaining?: number;
  subscribed: boolean;
  onNavigate: (tab: string) => void;
  onNavigateTo: (path: string) => void;
  onOpenInfoModal?: () => void;
}

interface Alert {
  id: string;
  type: "warning" | "info" | "action";
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ContextualAlerts = ({
  pendingBookings,
  tables,
  menuItems,
  hasLogo,
  hasDescription,
  hasOpeningHours,
  inTrial,
  trialDaysRemaining,
  subscribed,
  onNavigate,
  onNavigateTo,
  onOpenInfoModal,
}: ContextualAlertsProps) => {
  const alerts: Alert[] = [];

  // Alert prenotazioni in attesa
  if (pendingBookings > 0) {
    alerts.push({
      id: "pending-bookings",
      type: "action",
      icon: Clock,
      title: `${pendingBookings} prenotazion${pendingBookings === 1 ? "e" : "i"} in attesa`,
      description: "Conferma o rifiuta le prenotazioni per i tuoi clienti",
      action: {
        label: "Gestisci",
        onClick: () => onNavigate("bookings"),
      },
    });
  }

  // Alert trial in scadenza
  if (inTrial && trialDaysRemaining && trialDaysRemaining <= 5) {
    alerts.push({
      id: "trial-expiring",
      type: "warning",
      icon: Crown,
      title: `Il tuo trial scade tra ${trialDaysRemaining} giorni`,
      description: "Attiva un abbonamento per continuare a usare tutte le funzionalità",
      action: {
        label: "Abbonati ora",
        onClick: () => onNavigateTo("/billing"),
      },
    });
  }

  // Alert nessun tavolo
  if (tables === 0) {
    alerts.push({
      id: "no-tables",
      type: "info",
      icon: Table2,
      title: "Nessun tavolo configurato",
      description: "Aggiungi i tavoli per ricevere prenotazioni",
      action: {
        label: "Aggiungi tavolo",
        onClick: () => onNavigate("tables"),
      },
    });
  }

  // Alert nessun piatto
  if (menuItems === 0) {
    alerts.push({
      id: "no-menu",
      type: "info",
      icon: UtensilsCrossed,
      title: "Menu vuoto",
      description: "Aggiungi piatti al menu per mostrarlo ai clienti",
      action: {
        label: "Aggiungi piatto",
        onClick: () => onNavigate("menu"),
      },
    });
  }

  // Alert logo mancante
  if (!hasLogo && onOpenInfoModal) {
    alerts.push({
      id: "no-logo",
      type: "info",
      icon: Image,
      title: "Logo non caricato",
      description: "Carica un logo per rendere il tuo ristorante più riconoscibile",
      action: {
        label: "Carica logo",
        onClick: onOpenInfoModal,
      },
    });
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-4 border-emerald-500/30 bg-emerald-500/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Tutto a posto!</p>
            <p className="text-sm text-muted-foreground">Nessuna azione richiesta al momento</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 3).map((alert) => {
        const Icon = alert.icon;
        const bgColor = alert.type === "warning" 
          ? "bg-amber-500/5 border-amber-500/20" 
          : alert.type === "action" 
            ? "bg-primary/5 border-primary/20" 
            : "bg-muted/50";
        const iconColor = alert.type === "warning" 
          ? "text-amber-500 bg-amber-500/10" 
          : alert.type === "action" 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground bg-muted";

        return (
          <Card key={alert.id} className={`p-4 ${bgColor}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
              {alert.action && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={alert.action.onClick}
                  className="flex-shrink-0 hover:bg-muted transition-all duration-200"
                >
                  {alert.action.label}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

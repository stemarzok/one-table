import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Table2, 
  UtensilsCrossed, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  ChevronRight,
  ChevronLeft,
  X,
  Lightbulb,
  CheckCircle
} from "lucide-react";

interface DashboardTutorialProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const tutorialSteps = [
  {
    icon: LayoutDashboard,
    title: "Benvenuto nella Dashboard!",
    description: "Questa è la tua area di controllo per gestire il ristorante. Qui trovi una panoramica completa delle statistiche e delle attività recenti.",
  },
  {
    icon: Table2,
    title: "Gestione Tavoli",
    description: "Configura i tavoli del tuo ristorante: aggiungi numero tavolo, capacità posti e posizione (interno/esterno). I clienti potranno prenotare in base alla disponibilità.",
  },
  {
    icon: UtensilsCrossed,
    title: "Il Tuo Menu",
    description: "Crea e gestisci il menu del ristorante. Aggiungi piatti con nome, descrizione, categoria e prezzo. Puoi anche caricare foto per ogni piatto.",
  },
  {
    icon: Calendar,
    title: "Prenotazioni",
    description: "Visualizza e gestisci tutte le prenotazioni. Puoi confermare, modificare o cancellare le richieste dei clienti. Riceverai notifiche per ogni nuova prenotazione.",
  },
  {
    icon: MessageSquare,
    title: "Recensioni",
    description: "Leggi le recensioni dei clienti e rispondi per migliorare la tua reputazione online. Le risposte sono visibili a tutti gli utenti.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Monitora l'andamento del tuo ristorante con grafici dettagliati su prenotazioni, occupazione, e trend. Esporta i dati in formato CSV.",
  },
];

export const DashboardTutorial = ({ onComplete, onDismiss }: DashboardTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={onDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0 p-4 bg-primary/10 rounded-xl">
          <Icon className="w-12 h-12 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Tutorial • Passo {currentStep + 1} di {tutorialSteps.length}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2">{step.title}</h3>
          <p className="text-muted-foreground mb-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-6 bg-primary' 
                    : index < currentStep 
                      ? 'w-2 bg-primary/50' 
                      : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Indietro
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completato
                </>
              ) : (
                <>
                  Avanti
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground ml-auto"
            >
              Salta tutorial
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

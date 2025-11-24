import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Per continuare serve un abbonamento
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Ottieni accesso completo a tutte le funzionalità con il Piano Base o Pro
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">14 giorni di prova gratuita</p>
              <p className="text-sm text-muted-foreground">Testa tutte le funzionalità senza impegno</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Gestione completa</p>
              <p className="text-sm text-muted-foreground">Prenotazioni, menu, tavoli e analytics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Supporto prioritario</p>
              <p className="text-sm text-muted-foreground">Assistenza dedicata per il tuo business</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
          >
            Scegli un Piano
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Forse più tardi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

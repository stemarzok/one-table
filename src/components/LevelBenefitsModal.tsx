import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Crown, Check } from "lucide-react";
import { motion } from "framer-motion";

interface LevelBenefitsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: string;
}

const levels = [
  {
    name: "Bronze",
    displayName: "Bronzo",
    icon: Star,
    range: "0-100",
    benefits: [
      "Prenotazioni standard",
      "Accesso alla piattaforma",
      "Notifiche prenotazioni"
    ]
  },
  {
    name: "Silver",
    displayName: "Argento",
    icon: Award,
    range: "101-300",
    benefits: [
      "Priorità nelle prenotazioni",
      "5% di sconto sui conti",
      "Tavoli con vista migliore"
    ]
  },
  {
    name: "Gold",
    displayName: "Oro",
    icon: Crown,
    range: "301-600",
    benefits: [
      "Prenotazioni garantite",
      "15% di sconto sui conti",
      "Tavoli premium",
      "Welcome drink gratuito"
    ]
  },
  {
    name: "Platinum",
    displayName: "Platino",
    icon: Trophy,
    range: "601+",
    benefits: [
      "Accesso VIP illimitato",
      "25% di sconto sui conti",
      "I migliori tavoli disponibili",
      "Menu degustazione omaggio",
      "Concierge personale"
    ]
  }
];

const LevelBenefitsModal = ({ open, onOpenChange, currentLevel }: LevelBenefitsModalProps) => {
  const currentLevelIndex = levels.findIndex(l => l.name === currentLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Livelli e Vantaggi</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {levels.map((level, index) => {
            const Icon = level.icon;
            const isCurrentLevel = level.name === currentLevel;
            const isUnlocked = index <= currentLevelIndex;
            const isNext = index === currentLevelIndex + 1;
            
            return (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 ${
                  isCurrentLevel 
                    ? 'border-primary bg-primary/10' 
                    : isUnlocked 
                      ? 'border-muted-foreground/30 bg-muted/30' 
                      : 'border-muted bg-muted/10 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCurrentLevel ? 'bg-primary' : isUnlocked ? 'bg-muted-foreground/30' : 'bg-muted/50'
                  }`}>
                    <Icon className={`w-6 h-6 ${isCurrentLevel ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{level.displayName}</h3>
                      <Badge variant={isCurrentLevel ? "default" : "outline"} className="text-xs">
                        {level.range} punti
                      </Badge>
                      {isCurrentLevel && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Attuale
                        </Badge>
                      )}
                      {isNext && (
                        <Badge variant="secondary" className="text-xs">
                          Prossimo
                        </Badge>
                      )}
                    </div>
                    
                    <ul className="space-y-1 mt-2">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 ${isUnlocked ? 'text-primary' : 'text-muted-foreground/50'}`} />
                          <span className={isUnlocked ? 'text-foreground' : 'text-muted-foreground'}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LevelBenefitsModal;
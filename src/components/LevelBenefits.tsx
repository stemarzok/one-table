import { Badge } from "@/components/ui/badge";
import { Star, Crown, Sparkles, Trophy } from "lucide-react";

const levels = [
  {
    name: "Bronzo",
    icon: Star,
    color: "text-amber-700",
    bgColor: "bg-amber-100 dark:bg-amber-950",
    range: "0-100 punti",
    benefits: [
      "Prenotazioni standard",
      "Accesso alla piattaforma",
      "Notifiche prenotazioni"
    ]
  },
  {
    name: "Argento",
    icon: Sparkles,
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-900",
    range: "101-300 punti",
    benefits: [
      "Priorità nelle prenotazioni",
      "5% di sconto sui conti",
      "Tavoli con vista migliore"
    ]
  },
  {
    name: "Oro",
    icon: Crown,
    color: "text-accent",
    bgColor: "bg-accent/10",
    range: "301-600 punti",
    benefits: [
      "Prenotazioni garantite",
      "15% di sconto sui conti",
      "Tavoli premium",
      "Welcome drink gratuito"
    ]
  },
  {
    name: "Platino",
    icon: Trophy,
    color: "text-primary",
    bgColor: "bg-primary/10",
    range: "601+ punti",
    benefits: [
      "Accesso VIP illimitato",
      "25% di sconto sui conti",
      "I migliori tavoli disponibili",
      "Menu degustazione omaggio",
      "Concierge personale"
    ]
  }
];

const LevelBenefits = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            I Tuoi Vantaggi per Livello
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Più sali di livello, più vantaggi esclusivi ti aspettano
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <div 
                key={index}
                className="relative bg-gradient-card rounded-2xl p-6 shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-2xl ${level.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${level.color}`} />
                </div>
                
                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {level.name}
                </h3>
                
                <Badge variant="secondary" className="mb-4">
                  {level.range}
                </Badge>
                
                <ul className="space-y-2">
                  {level.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;

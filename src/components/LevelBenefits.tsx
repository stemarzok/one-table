import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, Crown, Sparkles, Trophy } from "lucide-react";

const levels = [
  {
    name: "Bronzo",
    icon: Star,
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    <section id="livelli" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            I Tuoi Vantaggi per Livello
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Più sali di livello, più vantaggi esclusivi ti aspettano
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {levels.map((level, index) => {
              const Icon = level.icon;
              return (
                <AccordionItem 
                  key={index} 
                  value={`level-${index}`}
                  className="bg-gradient-card rounded-2xl border-border/50 shadow-card overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`w-14 h-14 rounded-xl ${level.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-7 h-7 ${level.color}`} />
                      </div>
                      
                      <div className="text-left flex-1">
                        <h3 className="text-2xl font-bold text-card-foreground">
                          {level.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {level.range}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-semibold text-card-foreground mb-3">Vantaggi Inclusi:</h4>
                      <ul className="space-y-3">
                        {level.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-gradient-hero mt-1.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;

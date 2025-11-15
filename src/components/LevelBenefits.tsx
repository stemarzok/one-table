import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LevelBenefits = () => {
  const { t } = useLanguage();
  
  const levels = [
    {
      name: t('levels.bronze'),
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10",
      range: "0-100",
      benefits: [
        "Prenotazioni standard",
        "Accesso alla piattaforma",
        "Notifiche prenotazioni"
      ]
    },
    {
      name: t('levels.silver'),
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
      range: "101-300",
      benefits: [
        "Priorità nelle prenotazioni",
        "5% di sconto sui conti",
        "Tavoli con vista migliore"
      ]
    },
    {
      name: t('levels.gold'),
      icon: Crown,
      color: "text-primary",
      bgColor: "bg-primary/10",
      range: "301-600",
      benefits: [
        "Prenotazioni garantite",
        "15% di sconto sui conti",
        "Tavoli premium",
        "Welcome drink gratuito"
      ]
    },
    {
      name: t('levels.platinum'),
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
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

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
          {t('levels.title')}
        </h2>
        
        <div className="overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 cursor-grab active:cursor-grabbing">
          <div className="flex gap-6 min-w-max">
            {levels.map((level, index) => {
              const Icon = level.icon;
              return (
                <Card 
                  key={index}
                  className="p-8 hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-gradient-card min-w-[280px]"
                >
                  <div className={`w-16 h-16 rounded-full ${level.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${level.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">
                    {level.name}
                  </h3>
                  
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                    {level.range} punti
                  </Badge>
                  
                  <ul className="space-y-3">
                    {level.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;

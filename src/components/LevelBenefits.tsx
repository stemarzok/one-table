import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LevelBenefits = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const levels = [
    {
      name: t('levels.bronze'),
      icon: Star,
      gradient: "from-amber-600/20 to-amber-500/10",
      iconColor: "text-amber-500",
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
      gradient: "from-slate-400/20 to-slate-300/10",
      iconColor: "text-slate-400",
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
      gradient: "from-yellow-500/20 to-amber-400/10",
      iconColor: "text-yellow-500",
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
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
            {t('levels.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Più sei affidabile, più vantaggi esclusivi ottieni
          </p>
        </motion.div>
        
        <motion.div 
          className="overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="flex gap-6 min-w-max">
            {levels.map((level, index) => {
              const Icon = level.icon;
              return (
                <motion.div key={index} variants={cardVariants}>
                  <Card 
                    className={`p-8 bg-gradient-to-br ${level.gradient} border-border/50 hover:border-primary/30 min-w-[300px] transition-all duration-300 hover-lift`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-6 shadow-soft">
                      <Icon className={`w-8 h-8 ${level.iconColor}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-card-foreground mb-3">
                      {level.name}
                    </h3>
                    
                    <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 font-semibold">
                      {level.range} punti
                    </Badge>
                    
                    <ul className="space-y-3">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LevelBenefits;

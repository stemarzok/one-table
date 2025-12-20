import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Crown, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const LevelBenefits = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const levels = [
    {
      name: t('levels.bronze'),
      icon: Star,
      bgColor: "bg-[hsl(85,100%,50%)/8]",
      borderColor: "border-primary/30",
      iconBg: "bg-primary",
      iconColor: "text-black",
      badgeClass: "bg-primary/20 text-primary border-primary/30",
      accentColor: "bg-primary",
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
      bgColor: "bg-[hsl(85,100%,50%)/10]",
      borderColor: "border-primary/40",
      iconBg: "bg-primary",
      iconColor: "text-black",
      badgeClass: "bg-primary/20 text-primary border-primary/30",
      accentColor: "bg-primary",
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
      bgColor: "bg-[hsl(85,100%,50%)/12]",
      borderColor: "border-primary/50",
      iconBg: "bg-primary",
      iconColor: "text-black",
      badgeClass: "bg-primary/20 text-primary border-primary/30",
      accentColor: "bg-primary",
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
      bgColor: "bg-[hsl(85,100%,50%)/15]",
      borderColor: "border-primary/60",
      iconBg: "bg-primary",
      iconColor: "text-black",
      badgeClass: "bg-primary/20 text-primary border-primary/30",
      accentColor: "bg-primary",
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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section ref={ref} className="py-16 bg-[hsl(0,0%,8%)] relative">
      {/* Background decoration - più sottile */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            I Tuoi Vantaggi per Livello
          </h2>
          <p className="text-base text-white/60 max-w-xl mx-auto">
            Più sei affidabile, più vantaggi esclusivi ottieni
          </p>
        </motion.div>
        
        {/* Scroll controls */}
        <div className="relative py-4">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 backdrop-blur-sm border border-white/20 hidden md:flex"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 backdrop-blur-sm border border-white/20 hidden md:flex"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
          
          <motion.div 
            ref={scrollContainerRef}
            className="overflow-x-auto py-6 -mx-4 px-4 scroll-smooth cursor-grab active:cursor-grabbing hide-scrollbar"
            onScroll={checkScroll}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="flex gap-5 min-w-max px-2">
              {levels.map((level, index) => {
                const Icon = level.icon;
                return (
                  <motion.div 
                    key={index} 
                    variants={cardVariants}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group"
                  >
                    <Card 
                      className={`p-6 ${level.bgColor} border ${level.borderColor} w-[260px] h-[340px] flex flex-col transition-all duration-500 hover:shadow-xl hover:shadow-primary/15 backdrop-blur-sm relative`}
                    >
                      {/* Animated glow effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-transparent via-transparent to-primary/5 rounded-lg" />
                      
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      
                      <div className={`w-12 h-12 rounded-xl ${level.iconBg} flex items-center justify-center mb-4 shadow-md relative z-10`}>
                        <Icon className={`w-6 h-6 ${level.iconColor}`} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 relative z-10">
                        {level.name}
                      </h3>
                      
                      <Badge className={`mb-4 ${level.badgeClass} font-semibold w-fit relative z-10 border text-xs`}>
                        {level.range} punti
                      </Badge>
                      
                      <ul className="space-y-2 flex-1 relative z-10">
                        {level.benefits.map((benefit, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-2 text-white/75"
                            initial={{ opacity: 0, x: -10 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + (index * 0.1) + (i * 0.05) }}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${level.accentColor} mt-1.5 flex-shrink-0`} />
                            <span className="text-xs font-medium">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Scroll indicator hint */}
          <div className="flex justify-center mt-2 gap-2 md:hidden">
            <span className="text-white/40 text-xs">← Scorri per vedere tutti →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;

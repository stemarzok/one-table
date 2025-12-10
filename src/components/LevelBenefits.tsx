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
      bgGradient: "from-amber-900/20 via-amber-800/10 to-amber-900/5",
      borderColor: "border-amber-500/40",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconColor: "text-white",
      badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accentColor: "bg-amber-500",
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
      bgGradient: "from-slate-600/20 via-slate-500/10 to-slate-600/5",
      borderColor: "border-slate-400/40",
      iconBg: "bg-gradient-to-br from-slate-400 to-slate-500",
      iconColor: "text-white",
      badgeBg: "bg-slate-400/20 text-slate-300 border-slate-400/30",
      accentColor: "bg-slate-400",
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
      bgGradient: "from-yellow-600/20 via-yellow-500/10 to-yellow-600/5",
      borderColor: "border-yellow-500/40",
      iconBg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      iconColor: "text-white",
      badgeBg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      accentColor: "bg-yellow-500",
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
      bgGradient: "from-primary/20 via-primary/10 to-primary/5",
      borderColor: "border-primary/40",
      iconBg: "bg-gradient-to-br from-primary to-[hsl(85,90%,35%)]",
      iconColor: "text-white",
      badgeBg: "bg-primary/20 text-primary border-primary/30",
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
    <section ref={ref} className="py-24 bg-[hsl(0,0%,6%)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
            {t('levels.title')}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Più sei affidabile, più vantaggi esclusivi ottieni
          </p>
        </motion.div>
        
        {/* Scroll controls */}
        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 backdrop-blur-sm border border-white/10 hidden md:flex"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12 backdrop-blur-sm border border-white/10 hidden md:flex"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
          
          <motion.div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-6 -mx-4 px-4 scroll-smooth cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={checkScroll}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="flex gap-6 min-w-max px-2">
              {levels.map((level, index) => {
                const Icon = level.icon;
                return (
                  <motion.div 
                    key={index} 
                    variants={cardVariants}
                    whileHover={{ 
                      y: -12, 
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    className="group"
                  >
                    <Card 
                      className={`p-8 bg-gradient-to-br ${level.bgGradient} border-2 ${level.borderColor} w-[320px] h-[420px] flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 backdrop-blur-sm relative overflow-hidden`}
                    >
                      {/* Animated glow effect on hover */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-transparent via-transparent to-white/5`} />
                      
                      {/* Decorative corner accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 ${level.accentColor} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                      
                      <div className={`w-16 h-16 rounded-2xl ${level.iconBg} flex items-center justify-center mb-6 shadow-lg relative z-10`}>
                        <Icon className={`w-8 h-8 ${level.iconColor}`} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
                        {level.name}
                      </h3>
                      
                      <Badge className={`mb-6 ${level.badgeBg} font-semibold w-fit relative z-10`}>
                        {level.range} punti
                      </Badge>
                      
                      <ul className="space-y-3 flex-1 relative z-10">
                        {level.benefits.map((benefit, i) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-3 text-white/70"
                            initial={{ opacity: 0, x: -10 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + (index * 0.1) + (i * 0.05) }}
                          >
                            <div className={`w-2 h-2 rounded-full ${level.accentColor} mt-2 flex-shrink-0 shadow-sm shadow-current`} />
                            <span className="text-sm font-medium">{benefit}</span>
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
          <div className="flex justify-center mt-4 gap-2 md:hidden">
            <span className="text-white/40 text-sm">← Scorri per vedere tutti →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;
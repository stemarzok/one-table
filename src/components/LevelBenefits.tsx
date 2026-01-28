import { Card } from "@/components/ui/card";
import { Trophy, Star, Award, Crown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const LevelBenefits = () => {
  const ref = useRef(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);
  
  const levels = [
    {
      name: "Bronzo",
      subtitle: "Inizia il percorso",
      icon: Star,
      range: "0-100",
      benefits: [
        "Accesso alla piattaforma",
        "Prenotazioni standard",
        "Notifiche e gestione semplice"
      ]
    },
    {
      name: "Argento",
      subtitle: "Inizia a distinguerti",
      icon: Award,
      range: "101-300",
      benefits: [
        "Priorità nelle prenotazioni",
        "5% di sconto",
        "Tavoli con vista migliore"
      ]
    },
    {
      name: "Oro",
      subtitle: "Accesso premium",
      icon: Crown,
      range: "301-600",
      benefits: [
        "Prenotazioni garantite",
        "15% di sconto",
        "Tavoli premium",
        "Welcome drink incluso"
      ]
    },
    {
      name: "Platino",
      subtitle: "Trattamento VIP",
      icon: Trophy,
      range: "601+",
      benefits: [
        "Accesso VIP illimitato",
        "25% di sconto",
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

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 280;
      const gap = 16;
      const scrollPosition = index * (cardWidth + gap);
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const cardWidth = 280;
      const gap = 16;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(newIndex, levels.length - 1));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, activeIndex - 1) 
      : Math.min(levels.length - 1, activeIndex + 1);
    scrollToCard(newIndex);
  };

  return (
    <section ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <motion.span 
            className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Sistema a livelli
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 tracking-wide font-display uppercase">
            Più sei affidabile, più vieni premiato
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ogni livello sblocca vantaggi esclusivi. Il tuo percorso inizia ora.
          </p>
        </motion.div>
        
        {/* Desktop: 4 column grid */}
        <motion.div 
          className="hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:max-w-6xl lg:mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {levels.map((level, index) => {
            const Icon = level.icon;
            return (
              <motion.div 
                key={index} 
                variants={cardVariants}
                whileHover={{ 
                  y: -8, 
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group"
              >
                <Card 
                  className="p-6 bg-card border border-border h-full flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-lg relative overflow-hidden"
                >
                  {/* Icon */}
                  <div className="relative z-10 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className="mb-4 relative z-10">
                    <h3 className="text-2xl font-bold text-foreground mb-1">
                      {level.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">{level.subtitle}</p>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg mb-5 w-fit relative z-10">
                    <span className="text-primary font-semibold text-sm">{level.range} punti</span>
                  </div>
                  
                  <ul className="space-y-3 flex-1 relative z-10">
                    {level.benefits.map((benefit, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-start gap-3 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.5 + (index * 0.1) + (i * 0.05) }}
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Mobile/Tablet: Horizontal scroll with touch support */}
        <div className="lg:hidden relative">
          {activeIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -left-2 top-[140px] z-20 bg-background/80 hover:bg-background text-foreground rounded-full w-10 h-10 backdrop-blur-sm border border-border hidden sm:flex"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {activeIndex < levels.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-2 top-[140px] z-20 bg-background/80 hover:bg-background text-foreground rounded-full w-10 h-10 backdrop-blur-sm border border-border hidden sm:flex"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
          
          <motion.div 
            ref={scrollContainerRef}
            className="overflow-x-auto py-4 scroll-smooth hide-scrollbar touch-pan-x"
            style={{ 
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            }}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <div className="flex gap-4 min-w-max px-1">
              {levels.map((level, index) => {
                const Icon = level.icon;
                return (
                  <motion.div 
                    key={index} 
                    variants={cardVariants}
                    className="group"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Card 
                      className="p-5 bg-card border border-border w-[260px] h-[340px] flex flex-col transition-all duration-300 hover:border-primary/40 relative overflow-hidden"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-foreground mb-0.5">
                          {level.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">{level.subtitle}</p>
                      </div>
                      
                      <div className="inline-flex px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4 w-fit">
                        <span className="text-primary font-semibold text-xs">{level.range} punti</span>
                      </div>
                      
                      <ul className="space-y-2 flex-1">
                        {level.benefits.map((benefit, i) => (
                          <li 
                            key={i} 
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          
          {/* Dot indicators - clickable */}
          <div className="flex justify-center mt-4 gap-2">
            {levels.map((_, index) => (
              <button 
                key={index}
                onClick={() => scrollToCard(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'w-6 h-2 bg-primary' 
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Vai al livello ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LevelBenefits;

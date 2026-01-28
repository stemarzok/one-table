import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, UserPlus, Utensils, Clock, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const HowItWorksEnhanced = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Crea il tuo account",
      description: "Registrati gratuitamente e inizia a prenotare.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80"
    },
    {
      number: "2",
      icon: Utensils,
      title: "Prenota un ristorante",
      description: "Scegli tra ristoranti selezionati e prenota in pochi click.",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"
    },
    {
      number: "3",
      icon: Clock,
      title: "Rispetta la prenotazione",
      description: "Arriva puntuale e vivi l'esperienza.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
    },
    {
      number: "4",
      icon: Trophy,
      title: "Sblocca vantaggi VIP",
      description: "Ogni prenotazione rispettata ti fa salire di livello e ti premia.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
    }
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, []);

  return (
    <section id="how-it-works" className="py-20 bg-muted/30 relative z-10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Il tuo comportamento diventa valore
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Non basta prenotare, conta come ti comporti.
          </p>
        </motion.div>

        {/* Desktop: grid 4 columns centered */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:max-w-5xl lg:mx-auto py-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="group/card"
              >
                <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-elegant transition-shadow duration-300 h-72">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                  
                  {/* Step number badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">{step.number}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="font-bold text-white text-base leading-tight mb-2">
                      {step.title}
                    </h4>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="relative group lg:hidden">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute -left-2 top-[calc(50%-1rem)] z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 ${!canScrollLeft ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute -right-2 top-[calc(50%-1rem)] z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 ${!canScrollRight ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="flex-shrink-0 w-[260px] group/card"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-72">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                    
                    {/* Step number badge */}
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">{step.number}</span>
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h4 className="font-bold text-white text-base leading-tight mb-2">
                        {step.title}
                      </h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Scroll hint */}
          <div className="flex justify-center mt-2 gap-2">
            <span className="text-muted-foreground text-xs">← Scorri per vedere tutti →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksEnhanced;

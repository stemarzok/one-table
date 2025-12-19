import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Prenota il Tuo Tavolo",
    description: "Scegli tra centinaia di ristoranti partner e prenota in pochi click.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
  },
  {
    number: "2",
    title: "Sii Puntuale",
    description: "Presentati in orario alla tua prenotazione per guadagnare punti reputazione.",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80"
  },
  {
    number: "3",
    title: "Aumenta il Tuo Livello",
    description: "Più sei affidabile, più velocemente sali di livello e sblocchi vantaggi.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80"
  },
  {
    number: "4",
    title: "Goditi i Benefici",
    description: "Tavoli premium, sconti esclusivi e trattamenti VIP ti aspettano.",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80"
  }
];

const HowItWorks = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
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
    <section id="come-funziona" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Come Funziona
          </h3>
          <p className="text-sm text-muted-foreground">Un sistema semplice che premia la tua affidabilità</p>
        </div>

        <div className="relative group">
          {/* Navigation Arrows */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${!canScrollLeft ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${!canScrollRight ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-shrink-0 w-[220px] group/card"
              >
                {/* Card verticale stile pulito */}
                <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-72">
                  {/* Immagine */}
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                  
                  {/* Gradiente nero dal basso */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Badge numero */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">{step.number}</span>
                  </div>
                  
                  {/* Content area */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-bold text-white text-base leading-tight mb-1">
                      {step.title}
                    </h4>
                    <p className="text-white/80 text-xs leading-relaxed line-clamp-3">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

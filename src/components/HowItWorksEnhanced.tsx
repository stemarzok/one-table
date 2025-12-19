import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import earnPointsImage from "@/assets/earn-points.jpg";
import vipBenefitsImage from "@/assets/vip-benefits.jpg";

const HowItWorksEnhanced = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const steps = [
    {
      number: "1",
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.desc'),
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80"
    },
    {
      number: "2",
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.desc'),
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80"
    },
    {
      number: "3",
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.desc'),
      image: earnPointsImage
    },
    {
      number: "4",
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.desc'),
      image: vipBenefitsImage
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
      const scrollAmount = 220;
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
    <section className="py-16 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('howItWorks.title')}
          </h3>
          <p className="text-sm text-muted-foreground">Quattro semplici passaggi per iniziare a guadagnare vantaggi esclusivi</p>
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
                className="flex-shrink-0 w-[200px] group/card"
              >
                {/* Card verticale stile pulito come CuisineCarousel */}
                <div className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 h-64">
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
                    <h4 className="font-bold text-white text-sm leading-tight mb-1">
                      {step.title}
                    </h4>
                    <p className="text-white/80 text-xs leading-relaxed line-clamp-2">
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

export default HowItWorksEnhanced;

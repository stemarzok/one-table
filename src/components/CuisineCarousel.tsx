import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface CuisineCategory {
  name: string;
  image: string;
}

const CUISINE_CATEGORIES: CuisineCategory[] = [
  { name: "Italiana", image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&q=80" },
  { name: "Sushi / Giapponese", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80" },
  { name: "Pizzeria", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80" },
  { name: "Cinese", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
  { name: "Mediterranea", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" },
  { name: "Americana", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80" },
  { name: "Messicana", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
  { name: "Indiana", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80" },
  { name: "Steakhouse", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80" },
  { name: "Pesce / Seafood", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" },
  { name: "Vegano", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  { name: "Fine Dining", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" },
];

interface CuisineCarouselProps {
  onCategorySelect?: (category: string) => void;
}

const CuisineCarousel = ({ onCategorySelect }: CuisineCarouselProps) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleCategoryClick = (categoryName: string) => {
    if (!isDragging && onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 10);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div id="cuisine-carousel" className="mb-8 sm:mb-10 scroll-mt-24 overflow-x-hidden">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" />
          {t('restaurants.exploreByCategory')}
        </h3>
        <p className="text-sm text-muted-foreground">{t('restaurants.discoverByCuisine')}</p>
      </div>

      <div className="relative group py-2">
        {/* Navigation Arrows - positioned with fixed calc to prevent movement */}
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute -left-2 top-[calc(50%-0.5rem)] z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 ${!canScrollLeft ? 'hidden' : ''}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute -right-2 top-[calc(50%-0.5rem)] z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 ${!canScrollRight ? 'hidden' : ''}`}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <div 
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto overflow-y-visible scrollbar-hide py-2 scroll-smooth touch-pan-x ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          {CUISINE_CATEGORIES.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex-shrink-0 w-[140px] sm:w-[180px] cursor-pointer group/card"
              onClick={() => handleCategoryClick(category.name)}
            >
              {/* Card categoria stile TripAdvisor verticale */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-elegant transition-shadow duration-300 h-40 sm:h-56">
                {/* Immagine */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                
                {/* Gradiente nero dal basso */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Nome categoria */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="font-bold text-white text-base leading-tight">
                    {category.name}
                  </h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CuisineCarousel;

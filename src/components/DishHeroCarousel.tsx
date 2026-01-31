import { useEffect, useRef, useState } from "react";

const DISH_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
    label: "Piatti Gourmet"
  },
  {
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80",
    label: "Sapori Freschi"
  },
  {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80",
    label: "Pizza Artigianale"
  },
  {
    url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&q=80",
    label: "Colazione Perfetta"
  },
  {
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&q=80",
    label: "Cucina Vegana"
  },
  {
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
    label: "Fine Dining"
  }
];

const DishHeroCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentLabel, setCurrentLabel] = useState(DISH_IMAGES[0].label);
  
  // Auto-scroll showreel effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let scrollSpeed = 1; // pixels per frame
    
    const animate = () => {
      if (!container) return;
      
      container.scrollLeft += scrollSpeed;
      
      // Reset to beginning when reaching the end (seamless loop)
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0;
      }
      
      // Update current label based on scroll position
      const imageWidth = container.scrollWidth / DISH_IMAGES.length;
      const currentIndex = Math.floor((container.scrollLeft + container.clientWidth / 2) / imageWidth) % DISH_IMAGES.length;
      setCurrentLabel(DISH_IMAGES[currentIndex]?.label || DISH_IMAGES[0].label);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-2xl">
      {/* Scrolling images container */}
      <div 
        ref={scrollRef}
        className="absolute inset-0 flex overflow-hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Double the images for seamless loop */}
        {[...DISH_IMAGES, ...DISH_IMAGES].map((dish, index) => (
          <div
            key={index}
            className="flex-shrink-0 h-full"
            style={{ width: '50%', minWidth: '300px' }}
          >
            <img
              src={dish.url}
              alt={dish.label}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
      
      {/* Current label */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 pointer-events-none">
        <span className="text-white/70 text-xs font-medium mb-1 block">Scopri le specialità</span>
        <h3 className="text-white text-2xl md:text-4xl font-bold font-display transition-all duration-300">
          {currentLabel}
        </h3>
      </div>
    </div>
  );
};

export default DishHeroCarousel;

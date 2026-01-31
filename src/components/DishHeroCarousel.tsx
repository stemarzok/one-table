import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DISH_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={DISH_IMAGES[currentIndex].url}
            alt={DISH_IMAGES[currentIndex].label}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Label */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-6 md:bottom-8 md:left-8"
          >
            <span className="text-white/80 text-sm font-medium mb-1 block">Scopri le specialità</span>
            <h3 className="text-white text-2xl md:text-4xl font-bold font-display">
              {DISH_IMAGES[currentIndex].label}
            </h3>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Dot indicators */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-1.5">
        {DISH_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index 
                ? 'w-6 h-2 bg-white' 
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DishHeroCarousel;

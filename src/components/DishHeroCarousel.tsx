import * as React from "react";

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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="relative w-full mb-8">
      <div 
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {DISH_IMAGES.map((dish, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-72 md:w-96 h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative w-full h-full">
              <img
                src={dish.url}
                alt={dish.label}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Label */}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                <span className="text-white/70 text-xs font-medium mb-1 block">Scopri</span>
                <h3 className="text-white text-xl md:text-2xl font-bold font-display">
                  {dish.label}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DishHeroCarousel;

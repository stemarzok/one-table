import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RestaurantCardCarouselProps {
  images: string[];
  alt: string;
}

export const RestaurantCardCarousel = ({ images, alt }: RestaurantCardCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={images[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
      />
      
      {/* Navigation buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover/card:opacity-100 z-10"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover/card:opacity-100 z-10"
      >
        <ChevronRight className="w-4 h-4 text-gray-700" />
      </button>
      
      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white w-3' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

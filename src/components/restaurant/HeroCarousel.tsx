import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroCarouselProps {
  coverImage?: string;
  galleryImages?: string[];
  restaurantName: string;
}

export const HeroCarousel = ({ coverImage, galleryImages = [], restaurantName }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine cover image with gallery images
  const allImages = [
    coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    ...(galleryImages || [])
  ].filter(Boolean);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden rounded-xl group">
      {/* Main Image */}
      <img
        src={allImages[currentIndex]}
        alt={`${restaurantName} - ${currentIndex + 1}`}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-500"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      
      {/* Image counter */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
        <Images className="w-4 h-4" />
        <span>{currentIndex + 1} / {allImages.length}</span>
      </div>

      {allImages.length > 1 && (
        <>
          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            aria-label="Immagine precedente"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            aria-label="Immagine successiva"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {allImages.slice(0, 5).map((img, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Vai all'immagine ${index + 1}`}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-white shadow-lg scale-105' 
                    : 'border-white/40 hover:border-white/80'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {allImages.length > 5 && (
              <div className="w-16 h-12 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium border-2 border-white/40">
                +{allImages.length - 5}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

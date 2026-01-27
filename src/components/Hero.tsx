import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroModern from "@/assets/hero-modern.jpg";

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <img 
          src={heroModern}
          alt="Restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Strong Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-15" />
      </motion.div>
      
      <motion.div 
        className="container mx-auto px-4 z-10 relative pt-24"
        style={{ y: textY }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            {/* Main Heading */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              I migliori tavoli,
              <span className="block text-primary mt-2">
                per chi se li merita.
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto font-medium px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Con One-Table premiamo chi è puntuale e affidabile: più rispetti le prenotazioni, più sblocchi vantaggi VIP nei migliori ristoranti.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                variant="premium"
                className="text-base px-8 py-6 gap-3 w-full sm:w-auto"
                onClick={() => window.location.href = '/auth'}
              >
                <Search className="w-5 h-5" />
                Cerca un ristorante
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
                onClick={scrollToHowItWorks}
              >
                Come funziona
                <ChevronDown className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

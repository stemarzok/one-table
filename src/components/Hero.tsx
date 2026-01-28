import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroVideo from "@/assets/hero-video.mp4";

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

  // Text reveal animation variants
  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 80,
      filter: "blur(12px)"
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.77, 0, 0.175, 1]
      }
    }
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Strong Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </motion.div>
      
      <motion.div 
        className="container mx-auto px-4 z-10 relative"
        style={{ y: textY }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Main Heading - Bebas Neue Giant Title */}
            <div className="overflow-hidden mb-8">
              <motion.h1 
                className="font-display text-[12vw] sm:text-[11vw] md:text-[10vw] lg:text-[9vw] xl:text-[8vw] font-normal text-white leading-[0.9] tracking-[0.02em] uppercase"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.12
                    }
                  }
                }}
              >
                <motion.span 
                  className="block"
                  variants={titleVariants}
                >
                  I Migliori Tavoli
                </motion.span>
                <motion.span 
                  className="block text-primary drop-shadow-[0_0_30px_hsl(85,100%,50%,0.5)]"
                  variants={titleVariants}
                  style={{
                    textShadow: "0 0 40px hsl(85, 100%, 50%, 0.4), 0 0 80px hsl(85, 100%, 50%, 0.2)"
                  }}
                >
                  Per Chi Se Li Merita
                </motion.span>
              </motion.h1>
            </div>
            
            {/* Subtitle */}
            <motion.p 
              className="text-sm sm:text-base md:text-lg text-white/70 mb-10 leading-relaxed max-w-xl mx-auto font-medium px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Più rispetti le prenotazioni, più sblocchi vantaggi VIP nei migliori ristoranti.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Button 
                size="lg" 
                variant="premium"
                className="text-base px-8 py-6 gap-3 w-full sm:w-auto font-bold"
                onClick={() => {
                  const element = document.getElementById('restaurant-list');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Search className="w-5 h-5" />
                Cerca un ristorante
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto font-semibold"
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
        transition={{ duration: 0.6, delay: 1.4 }}
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

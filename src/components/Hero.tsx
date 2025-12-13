import { Star, Award, TrendingUp } from "lucide-react";
import SearchBar from "./SearchBar";
import RestaurantFilters from "./RestaurantFilters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroModern from "@/assets/hero-modern.jpg";

const Hero = () => {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
          poster={heroModern}
        >
          <source src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        {/* Strong Dark Overlay for readability */}
        <div className="absolute inset-0 bg-black/80" />
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-20" />
      </motion.div>
      
      <motion.div 
        className="container mx-auto px-4 z-10 relative pt-24"
        style={{ y: textY }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Premium Badge */}
          <motion.div 
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-white/90 font-medium text-sm">{t('hero.badge')}</span>
            </div>
          </motion.div>
          
          <div className="text-center">
            {/* Main Heading with Animation */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {t('hero.title1')}
              <span className="block text-primary mt-2">
                {t('hero.title2')}
              </span>
            </motion.h1>
            
            {/* Subtitle with Animation */}
            <motion.p 
              className="text-lg md:text-xl text-white/80 mb-12 leading-relaxed max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {t('hero.description')}
            </motion.p>
            
            {/* Search Bar with Animation */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <SearchBar 
                variant="hero"
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
              />
            </motion.div>
            
            {showFilters && (
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RestaurantFilters />
              </motion.div>
            )}
          
            {/* Stats with 3D Cards - centered below search */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <motion.div 
                className="flex items-center gap-4 px-6 py-4 bg-[hsl(0,0%,8%)] backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Star className="w-7 h-7 text-primary" fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-extrabold text-white">4.9/5</div>
                  <div className="text-sm text-white/70 font-medium">{t('hero.rating')}</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-4 px-6 py-4 bg-[hsl(0,0%,8%)] backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-extrabold text-white">500+</div>
                  <div className="text-sm text-white/70 font-medium">{t('hero.partners')}</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

import { Star, Award, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-modern.jpg";
import SearchBar from "./SearchBar";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(38, 38, 38, 0.88), rgba(38, 38, 38, 0.75)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-white font-medium">{t('hero.badge')}</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {t('hero.title1')}
              <span className="block text-primary drop-shadow-lg">
                {t('hero.title2')}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            
            <SearchBar />
          
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-6 h-6 text-primary" fill="currentColor" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-sm text-white/80">{t('hero.rating')}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-white/80">{t('hero.partners')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

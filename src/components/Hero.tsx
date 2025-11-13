import { Button } from "@/components/ui/button";
import { Star, Award, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-restaurant.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 21, 34, 0.85), rgba(139, 21, 34, 0.65)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <Award className="w-6 h-6 text-accent" />
            <span className="text-primary-foreground/90 font-medium">Sistema di Reputazione Innovativo</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Prenota, Guadagna,
            <span className="block bg-gradient-gold bg-clip-text text-transparent">
              Goditi i Vantaggi
            </span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Più sei puntuale e affidabile, più vantaggi ottieni: upgrade di tavoli con vista migliore, 
            sconti esclusivi e trattamenti VIP nei migliori ristoranti.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-elegant text-lg px-8">
              Inizia Ora
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8">
              Scopri Come Funziona
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" fill="currentColor" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">4.9/5</div>
                <div className="text-sm text-primary-foreground/80">Valutazione Media</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">500+</div>
                <div className="text-sm text-primary-foreground/80">Ristoranti Partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

import { CheckCircle, Clock, Gift, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: CheckCircle,
    title: "Prenota il Tuo Tavolo",
    description: "Scegli tra centinaia di ristoranti partner e prenota in pochi click."
  },
  {
    icon: Clock,
    title: "Sii Puntuale",
    description: "Presentati in orario alla tua prenotazione per guadagnare punti reputazione."
  },
  {
    icon: TrendingUp,
    title: "Aumenta il Tuo Livello",
    description: "Più sei affidabile, più velocemente sali di livello e sblocchi vantaggi."
  },
  {
    icon: Gift,
    title: "Goditi i Benefici",
    description: "Tavoli premium, sconti esclusivi e trattamenti VIP ti aspettano."
  }
];

const stepImages = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80"
];

const HowItWorks = () => {
  return (
    <section id="come-funziona" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Come Funziona
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Un sistema semplice che premia la tua affidabilità con vantaggi esclusivi
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2"
              >
                {/* Immagine di sfondo */}
                <div 
                  className="h-48 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${stepImages[index]})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 to-foreground/90" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 -mt-10 relative z-10 shadow-lg bg-card border-2 border-primary">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-card-foreground mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

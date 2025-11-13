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

const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary">
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
                className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xl shadow-elegant">
                  {index + 1}
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mb-6 mt-2">
                  <Icon className="w-8 h-8 text-accent-foreground" />
                </div>
                
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

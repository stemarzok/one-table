import { motion } from "framer-motion";
import { Gift, TrendingUp, Star, Zap } from "lucide-react";

const ValueProposition = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Upgrade",
      description: "Tavoli migliori"
    },
    {
      icon: Gift,
      title: "Sconti",
      description: "Esclusivi"
    },
    {
      icon: Star,
      title: "VIP",
      description: "Trattamento riservato"
    },
    {
      icon: Zap,
      title: "Vantaggi",
      description: "Reali e immediati"
    }
  ];

  return (
    <section className="py-20 bg-background relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight font-display uppercase tracking-wide">
            One-Table non è una semplice prenotazione.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            È un sistema che trasforma il tuo comportamento in vantaggi reali: 
            upgrade, sconti, tavoli migliori e trattamenti riservati.
          </p>
        </motion.div>
        
        {/* Feature icons */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;

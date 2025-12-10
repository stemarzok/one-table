import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingDown, Users, Calendar, BarChart3, Shield, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const Business = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);
  
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    { icon: CheckCircle, title: "Riduzione No-Show", desc: "Sistema di reputazione che penalizza chi non si presenta, riducendo fino al 60% le mancate prenotazioni" },
    { icon: Users, title: "Clienti di Qualità", desc: "Attrai e premia i clienti più affidabili e puntuali con vantaggi esclusivi personalizzati" },
    { icon: Calendar, title: "Gestione Semplificata", desc: "Piattaforma intuitiva per gestire prenotazioni, valutazioni clienti e disponibilità in tempo reale" },
    { icon: BarChart3, title: "Analytics Avanzate", desc: "Dashboard completa con statistiche dettagliate su prenotazioni, tassi di presentazione e ricavi" },
    { icon: Shield, title: "Protezione Garantita", desc: "Sistema di verifica clienti e possibilità di richiedere depositi per prenotazioni di alto valore" },
    { icon: TrendingDown, title: "Costi Ridotti", desc: "Elimina sprechi e ottimizza il personale grazie a previsioni accurate sulle effettive presenze" },
  ];

  const steps = [
    { num: "1", title: "Registrazione e Setup", desc: "Crea il tuo profilo aziendale, configura i tavoli, gli orari e le politiche di prenotazione in pochi minuti." },
    { num: "2", title: "Accetta Prenotazioni", desc: "Ricevi prenotazioni dalla piattaforma e vedi automaticamente il livello di reputazione di ogni cliente." },
    { num: "3", title: "Valuta i Clienti", desc: "Dopo ogni prenotazione, valuta semplicemente se il cliente si è presentato e se è stato puntuale." },
    { num: "4", title: "Premia i Migliori", desc: "Offri vantaggi personalizzati ai clienti con reputazione elevata. Fidelizza i clienti migliori." },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
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
            <source src="https://videos.pexels.com/video-files/3298176/3298176-uhd_2560_1440_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(0,0%,5%)/80] via-[hsl(0,0%,8%)/70] to-[hsl(0,0%,8%)/90]" />
          <div className="absolute inset-0 mesh-gradient opacity-40" />
        </motion.div>
        
        <motion.div 
          className="container mx-auto px-4 z-10 relative pt-24"
          style={{ y: textY, opacity }}
        >
          <div className="max-w-3xl">
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Riduci i No-Show,
              <span className="block text-gradient mt-2">
                Aumenta i Ricavi
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Unisciti a OneTable e trasforma i tavoli vuoti in opportunità. Il nostro sistema di 
              reputazione incentiva i clienti affidabili e riduce drasticamente le mancate presentazioni.
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-4 px-6 py-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-10 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">€16 Miliardi</div>
                <p className="text-white/70 text-sm font-medium">Perdite annuali in Europa per no-show</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 font-semibold btn-premium"
                onClick={() => navigate('/business-registration')}
              >
                Registra il Tuo Ristorante
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-base px-8 font-semibold"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Scopri di Più
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20" />
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} id="benefits" className="py-24 bg-background mesh-gradient relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Perché Scegliere OneTable
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una soluzione completa per gestire le prenotazioni e premiare i clienti migliori
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold">{benefit.title}</CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {benefit.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
              Come Funziona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quattro semplici passaggi per iniziare a ridurre i no-show
            </p>
          </motion.div>

          <motion.div 
            className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={howItWorksInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-extrabold text-primary">{step.num}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {step.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[hsl(0,0%,8%)]" />
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white tracking-tight">
            Inizia a Ridurre i No-Show Oggi
          </h2>
          <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Unisciti a centinaia di ristoranti che hanno già aumentato i loro ricavi con OneTable
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 font-semibold btn-premium"
              onClick={() => navigate('/business-registration')}
            >
              Registra il Tuo Ristorante
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 text-base px-8 font-semibold"
              onClick={() => window.open('/brochure.pdf', '_blank')}
            >
              Scarica la Brochure
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Business;

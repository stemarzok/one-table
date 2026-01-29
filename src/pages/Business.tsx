import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingDown, Users, Calendar, BarChart3, Shield, ArrowRight, TrendingUp, ChevronDown, DollarSign, Star, ClipboardCheck, UserCheck, Award } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import businessHeroVideo from "@/assets/business-hero-video.mp4";

const Business = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const problemRef = useRef(null);
  const solutionRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);
  
  const problemInView = useInView(problemRef, { once: true, margin: "-100px" });
  const solutionInView = useInView(solutionRef, { once: true, margin: "-100px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const scrollToContent = () => {
    document.getElementById('problema')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const benefits = [
    { 
      icon: TrendingDown, 
      title: "Riduzione dei no-show", 
      desc: "Riduci fino al 60% delle mancate presentazioni grazie a un sistema che responsabilizza i clienti." 
    },
    { 
      icon: Users, 
      title: "Clienti di qualità", 
      desc: "Ricevi prenotazioni da utenti affidabili e premia chi rispetta il tuo locale." 
    },
    { 
      icon: Calendar, 
      title: "Gestione prenotazioni semplificata", 
      desc: "Un'unica piattaforma per disponibilità, prenotazioni e valutazione clienti." 
    },
    { 
      icon: BarChart3, 
      title: "Analytics per ristoranti", 
      desc: "Monitora tassi di presentazione, occupazione tavoli e ricavi in tempo reale." 
    },
    { 
      icon: Shield, 
      title: "Protezione del tuo business", 
      desc: "Verifica clienti e richiedi depositi per prenotazioni di alto valore." 
    },
    { 
      icon: DollarSign, 
      title: "Costi operativi ridotti", 
      desc: "Previsioni più accurate = meno sprechi di personale e risorse." 
    },
  ];

  const steps = [
    { 
      num: "1", 
      icon: ClipboardCheck,
      title: "Registrazione del ristorante", 
      desc: "Crea il profilo del tuo locale e imposta tavoli, orari e politiche." 
    },
    { 
      num: "2", 
      icon: UserCheck,
      title: "Prenotazioni qualificate", 
      desc: "Ricevi prenotazioni con visibilità immediata della reputazione del cliente." 
    },
    { 
      num: "3", 
      icon: Star,
      title: "Valutazione semplice", 
      desc: "Segnala la presenza del cliente dopo ogni prenotazione." 
    },
    { 
      num: "4", 
      icon: Award,
      title: "Fidelizzazione intelligente", 
      desc: "Premia i clienti migliori e costruisci una base di utenti affidabili." 
    },
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
      
      {/* Hero Section with Video */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden z-0">
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
            <source src={businessHeroVideo} type="video/mp4" />
          </video>
          {/* Strong Dark Overlay for readability */}
          <div className="absolute inset-0 bg-black/75" />
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
                  className="font-display text-[10vw] sm:text-[9vw] md:text-[8vw] lg:text-[7vw] xl:text-[6vw] font-normal text-white leading-[0.9] tracking-[0.02em] uppercase"
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
                    Meno no-show.
                  </motion.span>
                  <motion.span 
                    className="block text-primary drop-shadow-[0_0_30px_hsl(85,100%,50%,0.5)]"
                    variants={titleVariants}
                    style={{
                      textShadow: "0 0 40px hsl(85, 100%, 50%, 0.4), 0 0 80px hsl(85, 100%, 50%, 0.2)"
                    }}
                  >
                    Più clienti affidabili.
                  </motion.span>
                </motion.h1>
              </div>
              
              {/* Subtitle */}
              <motion.p 
                className="text-sm sm:text-base md:text-lg text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto font-medium px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                OneTable è la piattaforma di prenotazione per ristoranti che vogliono ridurre le mancate presentazioni, aumentare i ricavi e lavorare con clienti di qualità.
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
                  onClick={() => navigate('/business-registration')}
                >
                  Registra il tuo ristorante
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto font-semibold"
                  onClick={scrollToContent}
                >
                  Scopri come funziona
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

      {/* Problem Section */}
      <section ref={problemRef} id="problema" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide font-display uppercase">
              I no-show costano miliardi
              <span className="block text-primary mt-2">ai ristoranti</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
              In Europa, i no-show causano oltre <span className="text-foreground font-bold">16 miliardi di euro</span> di perdite ogni anno.
              <br />Tavoli vuoti, personale sprecato, ricavi persi.
              <br />OneTable nasce per risolvere questo problema alla radice.
            </p>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 bg-card border-destructive/20 hover:border-destructive/40 transition-all">
                  <div className="text-4xl md:text-5xl font-bold text-destructive mb-2">€16 Mld</div>
                  <p className="text-muted-foreground text-sm">perdite annuali in Europa</p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6 bg-card border-destructive/20 hover:border-destructive/40 transition-all">
                  <div className="text-4xl md:text-5xl font-bold text-destructive mb-2">15-20%</div>
                  <p className="text-muted-foreground text-sm">prenotazioni non rispettate</p>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={problemInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6 bg-card border-destructive/20 hover:border-destructive/40 transition-all">
                  <div className="text-4xl md:text-5xl font-bold text-destructive mb-2">€150+</div>
                  <p className="text-muted-foreground text-sm">perdita media per no-show</p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={solutionRef} className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={solutionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide font-display uppercase">
              Prenotazioni più intelligenti
              <span className="block text-primary mt-2">Clienti migliori</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
              Il nostro sistema di reputazione incentiva i clienti puntuali e penalizza chi non rispetta le prenotazioni.
              <br />Il risultato? <span className="text-foreground font-bold">Meno no-show, più affidabilità, più valore per ogni tavolo.</span>
            </p>

            {/* Social Proof */}
            <motion.div
              className="inline-flex items-center gap-4 px-8 py-6 bg-card/90 backdrop-blur-md rounded-2xl border border-primary/20 shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={solutionInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-4xl font-extrabold text-foreground">500+</div>
                <p className="text-muted-foreground font-medium">Ristoranti partner hanno già scelto OneTable</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} id="benefits" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-wide font-display uppercase">
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
                <Card className="group/card h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift cursor-pointer">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover/card:bg-primary/20 transition-colors">
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
      <section ref={howItWorksRef} id="come-funziona" className="py-24 bg-muted/30 relative overflow-hidden z-10">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-wide font-display uppercase">
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
                <Card className="group/card h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/card:bg-primary/20 transition-colors">
                        <step.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary mb-1">STEP {step.num}</div>
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

      {/* Final CTA Section */}
      <section ref={ctaRef} className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={businessHeroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/80" />
        </div>
        
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide font-display uppercase">
            Trasforma le prenotazioni
            <span className="block text-primary mt-2 drop-shadow-[0_0_30px_hsl(85,100%,50%,0.5)]">in valore</span>
          </h2>
          <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Unisciti ai ristoranti che stanno riducendo i no-show e aumentando i ricavi con OneTable.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              variant="premium"
              className="text-base px-8 py-6 font-bold"
              onClick={() => navigate('/business-registration')}
            >
              Registra il tuo ristorante
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Business;

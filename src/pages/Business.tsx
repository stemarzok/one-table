import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, TrendingDown, Users, Calendar, BarChart3, Shield, ArrowRight, 
  ChevronDown, DollarSign, Star, ClipboardCheck, UserCheck, Award, 
  XCircle, AlertTriangle, Ban, Percent, TrendingUp, Check
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import businessHeroVideo from "@/assets/business-hero-video.mp4";
import businessCtaVideo from "@/assets/business-cta-video.mp4";
import LogoScroller from "@/components/LogoScroller";
import featureRestaurant from "@/assets/business-feature-restaurant.jpg";
import featureCustomers from "@/assets/business-feature-customers.jpg";
import featureTables from "@/assets/business-feature-tables.jpg";
import featureAnalytics from "@/assets/business-feature-analytics.jpg";

const Business = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const problemRef = useRef(null);
  const comparisonRef = useRef(null);
  const solutionRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const tableRef = useRef(null);
  const ctaRef = useRef(null);
  
  const problemInView = useInView(problemRef, { once: true, margin: "-100px" });
  const comparisonInView = useInView(comparisonRef, { once: true, margin: "-100px" });
  const solutionInView = useInView(solutionRef, { once: true, margin: "-100px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });
  const tableInView = useInView(tableRef, { once: true, margin: "-100px" });
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

  const problemStats = [
    { 
      icon: AlertTriangle, 
      value: "€16 Mld", 
      label: "perdite annuali in Europa",
      color: "text-destructive"
    },
    { 
      icon: Percent, 
      value: "15-20%", 
      label: "prenotazioni non rispettate",
      color: "text-destructive"
    },
    { 
      icon: Ban, 
      value: "€150+", 
      label: "perdita media per no-show",
      color: "text-destructive"
    },
  ];

  const solutionStats = [
    { 
      icon: TrendingDown, 
      value: "-60%", 
      label: "riduzione no-show",
      color: "text-primary"
    },
    { 
      icon: TrendingUp, 
      value: "+35%", 
      label: "clienti più affidabili",
      color: "text-primary"
    },
    { 
      icon: DollarSign, 
      value: "+25%", 
      label: "aumento ricavi medi",
      color: "text-primary"
    },
  ];

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

  const comparisonData = [
    { feature: "Sistema di reputazione clienti", traditional: false, onetable: true },
    { feature: "Riduzione no-show automatica", traditional: false, onetable: true },
    { feature: "Analytics in tempo reale", traditional: false, onetable: true },
    { feature: "Filtro clienti affidabili", traditional: false, onetable: true },
    { feature: "Depositi e garanzie", traditional: false, onetable: true },
    { feature: "Notifiche e reminder", traditional: true, onetable: true },
    { feature: "Gestione tavoli", traditional: true, onetable: true },
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
                    className="block text-white"
                    variants={titleVariants}
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
                  variant="outline-hero"
                  className="text-base px-8 py-6 w-full sm:w-auto font-semibold"
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

      {/* Problem Section - Dark Background for Green Contrast */}
      <section ref={problemRef} id="problema" className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={problemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide font-display uppercase text-white">
                I no-show costano miliardi ai ristoranti
              </h2>
              
              <p className="text-lg md:text-xl text-white/60 mb-12 leading-relaxed max-w-3xl mx-auto">
                In Europa, i no-show causano perdite enormi ogni anno.
                <br />Tavoli vuoti, personale sprecato, ricavi persi.
                <br />OneTable nasce per risolvere questo problema alla radice.
              </p>
            </div>

            {/* Problem vs Solution Comparison */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Problem Column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={problemInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-semibold text-red-400 uppercase tracking-wide">Il Problema</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {problemStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={problemInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                            <stat.icon className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                            <p className="text-white/50 text-sm">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Solution Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={problemInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4 border border-primary/20">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Con OneTable</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {solutionStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={problemInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                      <div className="p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <stat.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                            <p className="text-white/50 text-sm">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logo Scroller - Social Proof */}
      <LogoScroller />

      {/* Solution Section with Images */}
      <section ref={solutionRef} className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={solutionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-wide font-display uppercase text-foreground">
                Prenotazioni più intelligenti, clienti migliori
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
                Il nostro sistema di reputazione incentiva i clienti puntuali e penalizza chi non rispetta le prenotazioni.
                <br />Il risultato? <span className="text-foreground font-bold">Meno no-show, più affidabilità, più valore per ogni tavolo.</span>
              </p>
            </div>

            {/* Feature Cards with Real Images */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { image: featureRestaurant, title: "Ristorante Verificato", desc: "Profilo professionale con tutte le informazioni del tuo locale" },
                { image: featureCustomers, title: "Clienti Qualificati", desc: "Vedi la reputazione di ogni cliente prima di confermare" },
                { image: featureTables, title: "Gestione Tavoli", desc: "Organizza sale e disponibilità in modo semplice" },
                { image: featureAnalytics, title: "Dati e Insight", desc: "Monitora performance e trend del tuo ristorante" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={solutionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="group/card h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift cursor-pointer overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader className="p-5">
                      <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                        {feature.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section ref={tableRef} className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={tableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-wide font-display uppercase">
                Perché scegliere OneTable?
              </h2>
              <p className="text-lg text-muted-foreground">
                Confronta le funzionalità con i sistemi tradizionali
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={tableInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-border/50 overflow-hidden bg-card"
            >
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-muted/50 border-b border-border/50">
                <div className="p-4 md:p-6 font-semibold text-foreground">Funzionalità</div>
                <div className="p-4 md:p-6 text-center font-semibold text-muted-foreground">Tradizionale</div>
                <div className="p-4 md:p-6 text-center font-semibold text-primary">OneTable</div>
              </div>
              
              {/* Table Rows */}
              {comparisonData.map((row, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={tableInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className={`grid grid-cols-3 border-b border-border/30 last:border-0 ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}
                >
                  <div className="p-4 md:p-6 text-sm md:text-base text-foreground">{row.feature}</div>
                  <div className="p-4 md:p-6 flex items-center justify-center">
                    {row.traditional ? (
                      <Check className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive/60" />
                    )}
                  </div>
                  <div className="p-4 md:p-6 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Dark for Green Contrast */}
      <section ref={benefitsRef} id="benefits" className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-wide font-display uppercase text-white">
              Tutti i Vantaggi
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
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
                <div className="group/card h-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 hover-lift cursor-pointer p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover/card:bg-primary/20 transition-colors">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-white/60 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} id="come-funziona" className="py-24 bg-muted/30 relative overflow-hidden z-10">
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
                <Card className="group/card h-full bg-card border-border/50 hover:border-border transition-all duration-300 hover-lift cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 group-hover/card:bg-muted/80 transition-colors">
                        <step.icon className="w-7 h-7 text-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-muted-foreground mb-1">STEP {step.num}</div>
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

      {/* Final CTA Section with New Video */}
      <section ref={ctaRef} className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={businessCtaVideo} type="video/mp4" />
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
            Trasforma le prenotazioni in valore
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

import { Card } from "@/components/ui/card";
import { UserPlus, Search, Award, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import earnPointsImage from "@/assets/earn-points.jpg";
import vipBenefitsImage from "@/assets/vip-benefits.jpg";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const HowItWorksEnhanced = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const steps = [
    {
      icon: UserPlus,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.desc'),
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&q=80"
    },
    {
      icon: Search,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.desc'),
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80"
    },
    {
      icon: Award,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.desc'),
      image: earnPointsImage
    },
    {
      icon: Sparkles,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.desc'),
      image: vipBenefitsImage
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section ref={ref} className="py-24 bg-muted/30 mesh-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quattro semplici passaggi per iniziare a guadagnare vantaggi esclusivi
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <Card 
                  className="overflow-hidden group cursor-pointer h-full bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover-lift"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-elegant transition-transform duration-300 group-hover:scale-110">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksEnhanced;

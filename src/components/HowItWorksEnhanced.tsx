import { Card } from "@/components/ui/card";
import { UserPlus, Search, Trophy, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksEnhanced = () => {
  const { t } = useLanguage();
  
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
      icon: Trophy,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.desc'),
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80"
    },
    {
      icon: Gift,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.desc'),
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-16">
          {t('howItWorks.title')}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksEnhanced;

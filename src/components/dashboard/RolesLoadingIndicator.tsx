import { motion } from "framer-motion";
import { Shield, Store, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RolesLoadingIndicatorProps {
  className?: string;
}

export const RolesLoadingIndicator = ({ className }: RolesLoadingIndicatorProps) => {
  const { t } = useLanguage();

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.15
      }
    }
  };

  const iconVariants = {
    initial: { opacity: 0, y: 20, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const dotVariants = {
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1, 0.8],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.2
      }
    })
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}
    >
      {/* Animated icons row */}
      <div className="flex items-center gap-6 mb-8">
        <motion.div
          variants={iconVariants}
          className="relative"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
          <div className="relative p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        <motion.div
          variants={spinnerVariants}
          animate="animate"
          className="text-primary"
        >
          <Loader2 className="w-6 h-6" />
        </motion.div>

        <motion.div
          variants={iconVariants}
          className="relative"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="absolute inset-0 bg-accent/20 rounded-full blur-xl"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="relative p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 backdrop-blur-sm">
            <Store className="w-8 h-8 text-accent-foreground" />
          </div>
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div
        variants={iconVariants}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Verifica permessi in corso
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Caricamento ruoli e autorizzazioni...
        </p>
        
        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-2 h-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "200px" }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-6 h-1 bg-muted rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>
    </motion.div>
  );
};

export default RolesLoadingIndicator;

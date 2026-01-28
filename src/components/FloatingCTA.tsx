import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on landing pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  useEffect(() => {
    if (!shouldShow) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling past the hero (roughly 100vh)
      const scrollThreshold = window.innerHeight * 0.8;
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldShow]);

  const scrollToRestaurants = () => {
    const element = document.getElementById('restaurant-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            variant="premium"
            size="lg"
            onClick={scrollToRestaurants}
            className="shadow-2xl shadow-primary/30 px-6 py-5 gap-2 font-bold"
          >
            <Search className="w-5 h-5" />
            Trova un ristorante
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCTA;

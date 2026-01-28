import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  useEffect(() => {
    // Only on desktop
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches && shouldShow) {
      const updateMousePosition = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        setIsVisible(true);
      };

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, [role="button"], input, textarea, select, .cursor-pointer');
        setIsHovering(!!isInteractive);
      };

      const handleMouseLeave = () => {
        setIsVisible(false);
      };

      window.addEventListener('mousemove', updateMousePosition);
      window.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mouseleave', handleMouseLeave);

      // Hide default cursor
      document.body.style.cursor = 'none';

      return () => {
        window.removeEventListener('mousemove', updateMousePosition);
        window.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.body.style.cursor = 'auto';
      };
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [shouldShow]);

  if (!shouldShow || !isVisible) return null;

  return (
    <>
      {/* Main cursor - always brand green */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - (isHovering ? 16 : 10),
          y: mousePosition.y - (isHovering ? 16 : 10),
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      >
        <div 
          className={`rounded-full bg-primary transition-all duration-200 ${
            isHovering ? 'w-8 h-8' : 'w-5 h-5'
          }`}
          style={{
            boxShadow: '0 0 20px hsl(85, 100%, 50%, 0.5), 0 0 40px hsl(85, 100%, 50%, 0.3)',
          }}
        />
      </motion.div>
      
      {/* Outer ring */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 18,
          y: mousePosition.y - 18,
          opacity: isVisible ? 0.3 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
      >
        <div 
          className="w-9 h-9 rounded-full border border-primary/50"
          style={{
            boxShadow: '0 0 10px hsl(85, 100%, 50%, 0.2)',
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
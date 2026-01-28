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
      {/* Main cursor - always brand green (no blend mode) */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - (isHovering ? 12 : 8),
          y: mousePosition.y - (isHovering ? 12 : 8),
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
          className={`rounded-full transition-all duration-200 ${
            isHovering ? 'w-6 h-6' : 'w-4 h-4'
          }`}
          style={{
            backgroundColor: 'hsl(85, 100%, 50%)',
            boxShadow: '0 0 15px hsl(85, 100%, 50%, 0.6), 0 0 30px hsl(85, 100%, 50%, 0.3)',
          }}
        />
      </motion.div>
      
      {/* Outer ring - subtle */}
      <motion.div
        className="fixed pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 14,
          y: mousePosition.y - 14,
          opacity: isVisible ? 0.4 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
      >
        <div 
          className="w-7 h-7 rounded-full"
          style={{
            border: '1px solid hsl(85, 100%, 50%, 0.5)',
            boxShadow: '0 0 8px hsl(85, 100%, 50%, 0.15)',
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
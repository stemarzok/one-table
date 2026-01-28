import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOverGreen, setIsOverGreen] = useState(false);
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
        
        // Check if hovering over green/primary elements
        const isPrimaryElement = target.classList.contains('bg-primary') ||
                                 target.closest('.bg-primary') !== null ||
                                 target.classList.contains('text-primary') ||
                                 target.closest('.text-primary') !== null;
        
        setIsOverGreen(isPrimaryElement);
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

  // When over green elements, use semi-transparent dark for legibility
  const cursorColor = isOverGreen ? 'rgba(0, 0, 0, 0.5)' : 'hsl(85, 100%, 50%)';
  const glowColor = isOverGreen ? 'rgba(255, 255, 255, 0.3)' : 'hsl(85, 100%, 50%, 0.6)';
  const ringColor = isOverGreen ? 'rgba(255, 255, 255, 0.4)' : 'hsl(85, 100%, 50%, 0.5)';

  return (
    <>
      {/* Main cursor */}
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
            backgroundColor: cursorColor,
            boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor.replace('0.6', '0.3').replace('0.3', '0.15')}`,
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
            border: `1px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor.replace('0.5', '0.15').replace('0.4', '0.1')}`,
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const BODY_CLASS = "has-custom-cursor";

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isOverGreen, setIsOverGreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  const isPathMatch = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setIsFinePointer(mq.matches);
    update();

    // Safari fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const add = (mq as any).addEventListener ? "addEventListener" : "addListener";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const remove = (mq as any).removeEventListener ? "removeEventListener" : "removeListener";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mq as any)[add]("change", update);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mq as any)[remove]("change", update);
    };
  }, []);

  // Only show on specific pages when NOT logged in
  const allowedPaths = ["/", "/business", "/pricing"]; 
  const shouldShow = !isLoggedIn && allowedPaths.some(isPathMatch);

  useEffect(() => {
    const enable = shouldShow && isFinePointer;
    document.body.classList.toggle(BODY_CLASS, enable);

    if (!enable) {
      setIsVisible(false);
      setIsHovering(false);
      setIsOverGreen(false);
      return;
    }

    const updateMousePosition = (e: globalThis.MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseOver = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        'button, a, [role="button"], input, textarea, select, .cursor-pointer'
      );
      setIsHovering(!!isInteractive);

      const isPrimaryElement =
        target.classList.contains("bg-primary") ||
        target.closest(".bg-primary") !== null ||
        target.classList.contains("text-primary") ||
        target.closest(".text-primary") !== null;

      setIsOverGreen(isPrimaryElement);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.body.classList.remove(BODY_CLASS);
    };
  }, [shouldShow, isFinePointer]);

  if (!shouldShow || !isVisible || !isFinePointer) return null;

  // When over green elements, use semi-transparent dark for legibility
  const cursorColor = isOverGreen ? 'rgba(0, 0, 0, 0.5)' : 'hsl(85, 100%, 50%)';
  const glowColor = isOverGreen ? 'rgba(255, 255, 255, 0.3)' : 'hsl(85, 100%, 50%, 0.6)';
  const ringColor = isOverGreen ? 'rgba(255, 255, 255, 0.4)' : 'hsl(85, 100%, 50%, 0.5)';

  const cursorSize = isHovering ? 24 : 16;
  const ringSize = 28;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 99999 }}
        animate={{
          x: mousePosition.x - cursorSize / 2,
          y: mousePosition.y - cursorSize / 2,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      >
        <div 
          className="rounded-full transition-all duration-200"
          style={{
            width: cursorSize,
            height: cursorSize,
            backgroundColor: cursorColor,
            boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor.replace('0.6', '0.3').replace('0.3', '0.15')}`,
          }}
        />
      </motion.div>
      
      {/* Outer ring - subtle */}
      <motion.div
        className="fixed pointer-events-none"
        style={{ zIndex: 99998 }}
        animate={{
          x: mousePosition.x - ringSize / 2,
          y: mousePosition.y - ringSize / 2,
          opacity: 0.4,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
      >
        <div 
          className="rounded-full"
          style={{
            width: ringSize,
            height: ringSize,
            border: `1px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringColor.replace('0.5', '0.15').replace('0.4', '0.1')}`,
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;

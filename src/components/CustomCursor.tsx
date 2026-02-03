import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const BODY_CLASS = "has-custom-cursor";

const CURSOR_SIZE = 16;
const RING_SIZE = 28;

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isOverGreen, setIsOverGreen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  // Avoid re-renders on every pointer move: drive position via MotionValues.
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  const cursorSpringX = useSpring(cursorX, { stiffness: 650, damping: 35, mass: 0.2 });
  const cursorSpringY = useSpring(cursorY, { stiffness: 650, damping: 35, mass: 0.2 });
  const ringSpringX = useSpring(ringX, { stiffness: 220, damping: 22, mass: 0.15 });
  const ringSpringY = useSpring(ringY, { stiffness: 220, damping: 22, mass: 0.15 });

  const latestPointer = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const hasMovedRef = useRef(false);

  // Refs to avoid state updates unless value actually changes
  const hoveringRef = useRef(false);
  const overGreenRef = useRef(false);
  const visibleRef = useRef(false);

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
    const enable = shouldShow && isFinePointer && !reduceMotion;
    document.body.classList.toggle(BODY_CLASS, enable);

    if (!enable) {
      hoveringRef.current = false;
      overGreenRef.current = false;
      visibleRef.current = false;
      hasMovedRef.current = false;

      setIsVisible(false);
      setIsHovering(false);
      setIsOverGreen(false);
      return;
    }

    const flushPointerToMotion = () => {
      rafId.current = null;
      const { x, y } = latestPointer.current;
      cursorX.set(x - CURSOR_SIZE / 2);
      cursorY.set(y - CURSOR_SIZE / 2);
      ringX.set(x - RING_SIZE / 2);
      ringY.set(y - RING_SIZE / 2);
    };

    const handlePointerMove = (e: PointerEvent) => {
      latestPointer.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = true;

      // Make cursor visible after first real pointer move (avoid initial flash at 0,0)
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      if (rafId.current == null) {
        rafId.current = window.requestAnimationFrame(flushPointerToMotion);
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = !!target.closest(
        'button, a, [role="button"], input, textarea, select, .cursor-pointer'
      );
      if (isInteractive !== hoveringRef.current) {
        hoveringRef.current = isInteractive;
        setIsHovering(isInteractive);
      }

      const isPrimaryElement =
        target.classList.contains("bg-primary") ||
        target.closest(".bg-primary") !== null ||
        target.classList.contains("text-primary") ||
        target.closest(".text-primary") !== null;

      if (isPrimaryElement !== overGreenRef.current) {
        overGreenRef.current = isPrimaryElement;
        setIsOverGreen(isPrimaryElement);
      }
    };

    const handleMouseLeave = () => {
      if (!visibleRef.current) return;
      visibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      // show again only after we've seen at least one pointermove
      if (!hasMovedRef.current) return;
      if (visibleRef.current) return;
      visibleRef.current = true;
      setIsVisible(true);
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    // Capture phase reduces bubbling noise and makes detection more reliable
    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      document.body.classList.remove(BODY_CLASS);
    };
  }, [shouldShow, isFinePointer, reduceMotion, cursorX, cursorY, ringX, ringY]);

  if (!shouldShow || !isVisible || !isFinePointer || reduceMotion) return null;

  // When over green elements, use semi-transparent dark for legibility
  const cursorColor = isOverGreen
    ? "hsl(var(--foreground) / 0.55)"
    : "hsl(var(--primary))";
  const glowStrong = isOverGreen
    ? "hsl(var(--background) / 0.28)"
    : "hsl(var(--primary) / 0.6)";
  const glowSoft = isOverGreen
    ? "hsl(var(--background) / 0.14)"
    : "hsl(var(--primary) / 0.25)";
  const ringColor = isOverGreen
    ? "hsl(var(--background) / 0.42)"
    : "hsl(var(--primary) / 0.5)";
  const ringShadow = isOverGreen
    ? "hsl(var(--background) / 0.12)"
    : "hsl(var(--primary) / 0.15)";

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none left-0 top-0 will-change-transform"
        style={{ zIndex: 99999, x: cursorSpringX, y: cursorSpringY }}
      >
        <motion.div 
          className="rounded-full"
          animate={{ scale: isHovering ? 1.5 : 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.2 }}
          style={{
            width: CURSOR_SIZE,
            height: CURSOR_SIZE,
            backgroundColor: cursorColor,
            boxShadow: `0 0 15px ${glowStrong}, 0 0 30px ${glowSoft}`,
          }}
        />
      </motion.div>
      
      {/* Outer ring - subtle */}
      <motion.div
        className="fixed pointer-events-none left-0 top-0 will-change-transform"
        style={{ zIndex: 99998, x: ringSpringX, y: ringSpringY, opacity: 0.4 }}
      >
        <motion.div 
          className="rounded-full"
          animate={{ scale: isHovering ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.2 }}
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            border: `1px solid ${ringColor}`,
            boxShadow: `0 0 8px ${ringShadow}`,
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clickPoolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef(0);
  const lastHoveredRef = useRef<Element | null>(null);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Soft ambient music
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  
  // Mechanical keyboard click - gaming style
  const clickSrc = "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=click-21156.mp3";

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize audio pool
  useEffect(() => {
    if (!shouldShow) return;

    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 5; i++) {
      const audio = new Audio(clickSrc);
      audio.volume = 0.25;
      audio.preload = 'auto';
      pool.push(audio);
    }
    clickPoolRef.current = pool;

    if (audioRef.current) {
      audioRef.current.volume = 0.08;
      audioRef.current.loop = true;
    }

    return () => {
      pool.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [shouldShow]);

  // Play click sound from pool
  const playClickSound = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    const pool = clickPoolRef.current;
    if (pool.length === 0) return;

    const audio = pool[poolIndexRef.current];
    poolIndexRef.current = (poolIndexRef.current + 1) % pool.length;
    
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  // Get the interactive parent element (card, button, link)
  const getInteractiveParent = (element: HTMLElement): Element | null => {
    // First check for card containers (highest priority - one sound per card)
    const card = element.closest('.group, .group\\/card, [class*="card"], .cursor-grab');
    if (card) return card;
    
    // Then check for buttons and links
    const button = element.closest('button, a[href], [role="button"]');
    if (button) return button;
    
    // Check if element itself is interactive
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      return element;
    }
    
    return null;
  };

  // Global mouseover listener
  useEffect(() => {
    if (!shouldShow) return;

    const handleMouseOver = (e: MouseEvent) => {
      if (!isPlayingRef.current) return;
      
      const target = e.target as HTMLElement;
      const interactiveParent = getInteractiveParent(target);
      
      // Only play sound if we entered a NEW interactive element
      if (interactiveParent && interactiveParent !== lastHoveredRef.current) {
        lastHoveredRef.current = interactiveParent;
        playClickSound();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      
      const currentParent = getInteractiveParent(target);
      const nextParent = relatedTarget ? getInteractiveParent(relatedTarget) : null;
      
      // Clear last hovered if we left the interactive element entirely
      if (currentParent && currentParent !== nextParent) {
        if (lastHoveredRef.current === currentParent) {
          lastHoveredRef.current = null;
        }
      }
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, [shouldShow, playClickSound]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!shouldShow) return null;

  const bars = [0, 1, 2, 3, 4];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <audio ref={audioRef} src={audioSrc} preload="none" />
      
      <button
        onClick={togglePlay}
        className="w-14 h-14 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-[3px] hover:bg-black/90 hover:border-primary/50 transition-all duration-300 group"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-[3px] bg-primary rounded-full"
            animate={isPlaying ? {
              height: [8, 20, 12, 24, 8],
            } : {
              height: 3,
            }}
            transition={isPlaying ? {
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.1,
              ease: "easeInOut",
            } : {
              duration: 0.3,
            }}
            style={{
              height: isPlaying ? undefined : 3,
            }}
          />
        ))}
      </button>
    </motion.div>
  );
};

export default AudioPlayer;

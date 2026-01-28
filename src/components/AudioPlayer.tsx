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
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Soft ambient music
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  
  // Spacebar / heavy key click - gaming keyboard
  const clickSrc = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_03460e4022.mp3?filename=spacebar-click-keyboard-101430.mp3";

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

  // Resolve a "hover sound root" so a card plays ONCE even when hovering its inner parts.
  // Priority:
  // 1) nearest ancestor with .cursor-pointer (our cards use it)
  // 2) actual interactive controls (buttons/links)
  const getHoverSoundRoot = useCallback((element: HTMLElement): HTMLElement | null => {
    const cardRoot = element.closest('.cursor-pointer') as HTMLElement | null;
    if (cardRoot) return cardRoot;
    const controlRoot = element.closest('button, a[href], [role="button"]') as HTMLElement | null;
    return controlRoot;
  }, []);

  // Global pointerover listener (more reliable than mouseover across scrolling / dynamic content)
  useEffect(() => {
    if (!shouldShow) return;

    const handlePointerOver = (e: PointerEvent) => {
      if (!isPlayingRef.current) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const root = getHoverSoundRoot(target);
      if (!root) return;

      // If we're moving within the SAME root, don't replay the sound.
      const related = e.relatedTarget as Node | null;
      if (related && root.contains(related)) return;

      playClickSound();
    };

    document.addEventListener('pointerover', handlePointerOver, true);
    
    return () => {
      document.removeEventListener('pointerover', handlePointerOver, true);
    };
  }, [shouldShow, getHoverSoundRoot, playClickSound]);

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

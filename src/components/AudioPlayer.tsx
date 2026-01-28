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
  const lastRootRef = useRef<HTMLElement | null>(null);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Soft ambient music
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  
  // User-provided typing track; we play only ~1s as a hover SFX
  const clickSrc = "/sounds/typewriter-hover.mp3";

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
      audio.volume = 0.85; // Much louder
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

    // Play a short slice (~0.5s) - cleaner single keystroke
    const sliceStart = 1.2; // Better keystroke in the track
    const sliceDurationMs = 500;

    const anyAudio = audio as any;
    if (anyAudio.__hoverStopTimer) clearTimeout(anyAudio.__hoverStopTimer);

    try {
      audio.currentTime = sliceStart;
    } catch {
      // ignore
    }
    audio.play().catch(() => {});

    anyAudio.__hoverStopTimer = setTimeout(() => {
      audio.pause();
      try {
        audio.currentTime = sliceStart;
      } catch {
        // ignore
      }
    }, sliceDurationMs);
  }, []);

  // Resolve a "hover sound root" so a card plays ONCE even when hovering its inner parts.
  // Priority:
  // 1) cards (.group/card or .cursor-pointer)
  // 2) actual interactive controls (buttons/links)
  const getHoverSoundRoot = useCallback((element: HTMLElement): HTMLElement | null => {
    const cardRoot = element.closest('.group\\/card, .cursor-pointer') as HTMLElement | null;
    if (cardRoot) return cardRoot;
    const controlRoot = element.closest('button, a[href], [role="button"]') as HTMLElement | null;
    return controlRoot;
  }, []);

  // Global pointer listeners (reliable across scrolling / dynamic content)
  useEffect(() => {
    if (!shouldShow) return;

    const resetLastRoot = () => {
      lastRootRef.current = null;
    };

    const handlePointerOver = (e: PointerEvent) => {
      if (!isPlayingRef.current) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const root = getHoverSoundRoot(target);
      if (!root) return;

      // Don't replay while moving within the same root
      if (lastRootRef.current === root) return;

      // If we're moving within the SAME root, don't replay the sound.
      const related = e.relatedTarget as Node | null;
      if (related && root.contains(related)) return;

      lastRootRef.current = root;
      playClickSound();
    };

    const handlePointerOut = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (!target) return;

      const currentRoot = getHoverSoundRoot(target);
      const nextRoot = relatedTarget ? getHoverSoundRoot(relatedTarget) : null;

      if (currentRoot && currentRoot !== nextRoot && lastRootRef.current === currentRoot) {
        lastRootRef.current = null;
      }
    };

    document.addEventListener('pointerover', handlePointerOver, true);
    document.addEventListener('pointerout', handlePointerOut, true);
    window.addEventListener('scroll', resetLastRoot, { passive: true });
    window.addEventListener('blur', resetLastRoot);
    document.addEventListener('visibilitychange', resetLastRoot);
    
    return () => {
      document.removeEventListener('pointerover', handlePointerOver, true);
      document.removeEventListener('pointerout', handlePointerOut, true);
      window.removeEventListener('scroll', resetLastRoot);
      window.removeEventListener('blur', resetLastRoot);
      document.removeEventListener('visibilitychange', resetLastRoot);
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

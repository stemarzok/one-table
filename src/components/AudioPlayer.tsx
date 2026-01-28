import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); // Ref to track state in event listeners
  const audioRef = useRef<HTMLAudioElement>(null);
  const typewriterPoolRef = useRef<HTMLAudioElement[]>([]);
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
  
  // Classic typewriter key sound - single key press
  const typewriterSrc = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=typewriter-key-1-6191.mp3";

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize audio pool for typewriter sounds (prevents overlapping issues)
  useEffect(() => {
    if (!shouldShow) return;

    // Create a pool of audio elements for rapid-fire sounds
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 5; i++) {
      const audio = new Audio(typewriterSrc);
      audio.volume = 0.3;
      audio.preload = 'auto';
      pool.push(audio);
    }
    typewriterPoolRef.current = pool;

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

  // Play typewriter sound from pool
  const playTypewriterSound = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    const pool = typewriterPoolRef.current;
    if (pool.length === 0) return;

    const audio = pool[poolIndexRef.current];
    poolIndexRef.current = (poolIndexRef.current + 1) % pool.length;
    
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  // Global mouseover listener for typewriter sound
  useEffect(() => {
    if (!shouldShow) return;

    const handleMouseOver = (e: MouseEvent) => {
      if (!isPlayingRef.current) return;
      
      const target = e.target as HTMLElement;
      
      // Check if target or any parent is an interactive element
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a[href]') ||
        target.closest('[role="button"]') ||
        target.closest('.group') ||
        target.closest('.group\\/card') ||
        target.closest('[class*="card"]') ||
        target.closest('.cursor-pointer') ||
        target.closest('.cursor-grab') ||
        target.closest('[class*="hover:"]') ||
        target.matches('[class*="card"]') ||
        target.matches('.cursor-pointer');

      if (isInteractive) {
        playTypewriterSound();
      }
    };

    // Use capture phase to catch events before they're handled
    document.addEventListener('mouseover', handleMouseOver, true);
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
    };
  }, [shouldShow, playTypewriterSound]);

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

  // Sound wave bars animation
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

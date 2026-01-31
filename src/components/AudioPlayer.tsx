import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const lastRootRef = useRef<HTMLElement | null>(null);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Show on landing pages for non-logged-in users AND on user pages (not business dashboard)
  const publicPaths = ['/', '/business', '/pricing'];
  const userPaths = ['/restaurants', '/restaurant/', '/profile', '/settings', '/my-bookings', '/reviews', '/favorites'];
  const businessDashboardPaths = ['/dashboard', '/analytics', '/billing', '/promo'];
  
  const isPublicPage = publicPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  const isUserPage = userPaths.some(path => location.pathname.startsWith(path));
  const isBusinessDashboard = businessDashboardPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );
  
  // Show for: non-logged-in on public pages, OR logged-in users NOT on business dashboard
  const shouldShow = (!isLoggedIn && isPublicPage) || (isLoggedIn && isUserPage && !isBusinessDashboard);

  // Soft ambient music
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  
  // User-provided typing track; we play only ~0.5s as a hover SFX
  const clickSrc = "/sounds/typewriter-hover.mp3";

  // Keep ref in sync with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize Web Audio API for loud click sounds
  useEffect(() => {
    if (!shouldShow) return;

    const initAudio = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        
        const response = await fetch(clickSrc);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
      } catch (e) {
        console.error('Failed to init audio:', e);
      }
    };

    initAudio();

    if (audioRef.current) {
      audioRef.current.volume = 0.08;
      audioRef.current.loop = true;
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [shouldShow]);

  // Play click sound with Web Audio API (allows volume > 1.0)
  const playClickSound = useCallback(() => {
    if (!isPlayingRef.current) return;
    
    const context = audioContextRef.current;
    const buffer = audioBufferRef.current;
    if (!context || !buffer) return;

    // Resume context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      context.resume();
    }

    // Create source and gain nodes
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    
    source.buffer = buffer;
    
    // Set moderate volume (1.2 = slightly louder than normal)
    gainNode.gain.value = 1.2;
    
    source.connect(gainNode);
    gainNode.connect(context.destination);

    // Play a short slice - keystroke at ~2.5s in the track
    const sliceStart = 2.5;
    const sliceDuration = 0.4;
    
    source.start(0, sliceStart, sliceDuration);
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
        className="w-12 h-12 rounded-full backdrop-blur-xl border-2 border-primary flex items-center justify-center gap-[2px] transition-all duration-300 group shadow-lg hover:scale-105 bg-background/80 hover:bg-background"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-[2px] rounded-full bg-primary"
            animate={isPlaying ? {
              height: [6, 16, 10, 20, 6],
            } : {
              height: 2,
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
              height: isPlaying ? undefined : 2,
            }}
          />
        ))}
      </button>
    </motion.div>
  );
};

export default AudioPlayer;

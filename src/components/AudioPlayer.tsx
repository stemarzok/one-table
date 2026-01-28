import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Soft ambient music - very low volume for immersion
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.08; // Very subtle ambient
      audioRef.current.loop = true;
    }
  }, []);

  // Create and play typewriter sound on hover
  useEffect(() => {
    if (!shouldShow) return;

    const playTypewriterSound = () => {
      if (!isPlaying) return;
      
      // Create audio context for typewriter sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Typewriter-like click sound
        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      } catch (e) {
        // Fallback: do nothing if audio context fails
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Trigger on buttons, links, and cards
      if (target.closest('button, a[href], [role="button"], .group, .group\\/card, [class*="card"], .cursor-pointer, .cursor-grab')) {
        playTypewriterSound();
      }
    };

    document.addEventListener('mouseover', handleMouseEnter);
    return () => document.removeEventListener('mouseover', handleMouseEnter);
  }, [isPlaying, shouldShow]);

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

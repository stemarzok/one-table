import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

// Create context for audio state
interface AudioContextType {
  isPlaying: boolean;
  playClickSound: () => void;
}

const AudioContext = createContext<AudioContextType>({ isPlaying: false, playClickSound: () => {} });

export const useAudioContext = () => useContext(AudioContext);

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Only show on specific pages when NOT logged in
  const allowedPaths = ['/', '/business', '/pricing'];
  const shouldShow = !isLoggedIn && allowedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Ambient music URL - soft lo-fi ambient (Wii-style immersive)
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  // Typewriter click sound - more mechanical
  const clickSoundSrc = "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=typewriter-key-1-6191.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.12; // Much lower - ambient background
      audioRef.current.loop = true;
    }
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.35; // More audible typewriter effect
    }
  }, []);

  // Add hover sound to buttons when audio is playing
  useEffect(() => {
    if (!shouldShow) return;

    const playClickSound = () => {
      if (isPlaying && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(() => {});
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a[href], [role="button"]')) {
        playClickSound();
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => document.removeEventListener('mouseenter', handleMouseEnter, true);
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
      <audio ref={clickSoundRef} src={clickSoundSrc} preload="auto" />
      
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

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Ambient music URL - royalty free
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  }, []);

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

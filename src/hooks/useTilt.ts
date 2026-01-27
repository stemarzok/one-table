import { useState, useRef, MouseEvent } from "react";

interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseTiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
}

export const useTilt = (options: UseTiltOptions = {}) => {
  const { max = 10, scale = 1.02, speed = 400 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltValues>({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - height / 2) / height) * -max;
    const rotateY = ((mouseX - width / 2) / width) * max;

    setTilt({ rotateX, rotateY, scale });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
  };

  return {
    ref,
    style,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
};

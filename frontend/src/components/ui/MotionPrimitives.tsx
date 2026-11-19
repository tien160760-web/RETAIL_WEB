import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, Variants } from 'framer-motion';

export const SPRING_PILL = {
  type: 'spring' as const,
  stiffness: 430,
  damping: 32,
  mass: 0.85,
};

export const SPRING_HOVER = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 22,
};

export const EXPO_EASE = [0.22, 1, 0.36, 1] as const;

export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(6px)',
    transition: { duration: 0.2, ease: EXPO_EASE },
  },
};

export const bentoItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.965,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.48,
      ease: EXPO_EASE,
    },
  },
};

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  formatter,
  duration = 0.95,
  className,
}: AnimatedNumberProps) {
  const prevRef = useRef<number>(0);
  const [display, setDisplay] = useState<string>(() => formatter(0));

  useEffect(() => {
    const startVal = prevRef.current;
    const controls = animate(startVal, value, {
      duration,
      ease: EXPO_EASE,
      onUpdate: (latest) => {
        setDisplay(formatter(Math.round(latest)));
      },
      onComplete: () => {
        prevRef.current = value;
        setDisplay(formatter(value));
      },
    });
    return () => controls.stop();
  }, [value, formatter, duration]);

  return <span className={className}>{display}</span>;
}

interface SpotlightGlassCardProps {
  children: React.ReactNode;
  className?: string;
  lift?: number;
  hoverGlow?: boolean;
}

export function SpotlightGlassCard({
  children,
  className = '',
  lift = -5,
  hoverGlow = true,
}: SpotlightGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={bentoItemVariants}
      onMouseMove={hoverGlow ? handleMouseMove : undefined}
      whileHover={
        lift !== 0
          ? {
              y: lift,
              transition: SPRING_HOVER,
            }
          : undefined
      }
      className={`glass-card ${hoverGlow ? 'spotlight-card' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

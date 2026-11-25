import React from 'react';
import { motion, Variants } from 'framer-motion';

export const SPRING_PILL = {
  type: 'tween' as const,
  duration: 0.15,
};

export const SPRING_HOVER = {
  type: 'tween' as const,
  duration: 0.15,
};

export const EXPO_EASE = [0.25, 0.1, 0.25, 1] as const;

export const pageContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 1 },
};

export const bentoItemVariants: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1 },
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
  className,
}: AnimatedNumberProps) {
  return <span className={className}>{formatter(value)}</span>;
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
}: SpotlightGlassCardProps) {
  return (
    <motion.div className={`glass-card ${className}`}>
      {children}
    </motion.div>
  );
}

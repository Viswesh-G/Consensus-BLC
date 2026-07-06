'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface MagneticButtonProps extends React.ComponentPropsWithoutRef<'a'> {
  children: React.ReactNode;
  magneticPull?: number;
}

export function MagneticButton({
  children,
  magneticPull = 0.35,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rawX = useSpring(0, { stiffness: 200, damping: 18, mass: 0.08 });
  const rawY = useSpring(0, { stiffness: 200, damping: 18, mass: 0.08 });

  // Inner content moves slightly less than outer — parallax feel
  const innerX = useTransform(rawX, (v) => v * 0.4);
  const innerY = useTransform(rawY, (v) => v * 0.4);

  const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    rawX.set((clientX - (left + width / 2)) * magneticPull);
    rawY.set((clientY - (top + height / 2)) * magneticPull);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.a
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={reset}
      style={{ x: rawX, y: rawY }}
      className={`relative overflow-hidden ${className ?? ''}`}
      {...props}
    >
      {/* Shimmer sweep on hover */}
      <motion.span
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={isHovered ? { backgroundPosition: ['200% 0', '-200% 0'] } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Inner content with lighter parallax */}
      <motion.span
        className="relative z-20 flex items-center gap-2"
        style={{ x: innerX, y: innerY }}
      >
        {children}
      </motion.span>
    </motion.a>
  );
}


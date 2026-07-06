
/**
 * StickyHeader — animated header that reacts to scroll position.
 * - Transparent + mix-blend-difference at the top (hero overlap)
 * - Frosted glass panel slides in after first scroll
 * - Logo does a subtle scale-up pop on first render
 */

"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface Props {
  header: string;
}

export function StickyHeader({ header }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
      initial={false}
    >
      {/* Frosted glass background — slides down when user scrolls */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="header-bg"
            className="absolute inset-0 backdrop-blur-xl bg-bg-base/70 border-b border-border-subtle shadow-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Logo */}
      <motion.div
        className={`relative z-10 flex items-center gap-2.5 font-display font-bold tracking-tight text-lg transition-colors duration-300 ${
          scrolled ? 'text-fg-base' : 'text-fg-base mix-blend-difference dark:mix-blend-normal'
        }`}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          initial={{ rotate: -30, scale: 0.6 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Hexagon size={24} strokeWidth={1.5} className="text-[oklch(57%_0.18_264)]" />
        </motion.div>
        <span>{header}</span>
      </motion.div>

      {/* Theme toggle */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <ThemeToggle />
      </motion.div>
    </motion.header>
  );
}

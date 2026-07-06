'use client';

/**
 * HeroSection — orchestrates the D3 network canvas + headline + scroll cue.
 *
 * Parallax strategy (spec-compliant):
 *   - Text layer moves at 1× scroll speed (standard scroll-out behavior)
 *   - Network canvas drifts at 0.4× speed (depth illusion without JS scroll listeners)
 *   - prefers-reduced-motion: transforms become no-ops via `useReducedMotion`
 *
 * Interactive enhancements:
 *   - Character-staggered headline reveal animation
 *   - Magnetic CTA button with shimmer
 *   - Scroll cue with bouncing arrow
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { useScroll, useTransform, motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { type SiteContent } from '@/lib/content';
import { MagneticButton } from '@/components/ui/magnetic-button';

// SSR-disabled: D3 references `window`/`document` at init time.
const NetworkCanvas = dynamic(
  () => import('./network-canvas').then((m) => m.NetworkCanvas),
  { ssr: false }
);

interface Props {
  content: SiteContent['hero'];
}

/** Splits a string and wraps each character in an individually animated span */
function AnimatedText({
  text,
  className,
  charStyle,
  delay = 0,
}: {
  text: string;
  className?: string;
  charStyle?: React.CSSProperties;
  delay?: number;
}) {
  const prefersReduced = useReducedMotion();
  const chars = text.split('');

  if (prefersReduced) {
    return <span className={className} style={charStyle}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            ...(charStyle ?? {}),
          }}
          initial={{ opacity: 0, y: 28, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.025,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection({ content }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollY } = useScroll();
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Network drifts slower than the viewport — creates depth layering.
  const networkY = useTransform(
    scrollY,
    [0, viewportHeight],
    prefersReduced ? [0, 0] : [0, viewportHeight * 0.3]
  );
  // Text exits faster — encourages the reader to scroll.
  const textY = useTransform(
    scrollY,
    [0, viewportHeight],
    prefersReduced ? [0, 0] : [0, -viewportHeight * 0.15]
  );

  // Scroll cue fades out after user first scrolls
  const [showScrollCue, setShowScrollCue] = useState(true);
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => {
      if (v > 40) setShowScrollCue(false);
    });
    return () => unsub();
  }, [scrollY]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      aria-label="Hero: blockchain consensus visualisation"
    >
      {/* ── Background: D3 network canvas (parallaxed) ─────────────────── */}
      <motion.div
        style={{ y: networkY }}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <NetworkCanvas className="opacity-70 dark:opacity-50" />
      </motion.div>

      {/* ── Scrim: radial gradient for text legibility in both modes ─────── */}
      <div
        className="absolute inset-0 z-10 hero-scrim pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Text content (parallaxed faster) ─────────────────────────────── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-sm font-medium tracking-widest uppercase text-fg-muted mb-6 font-sans"
        >
          {content.eyebrow}
        </motion.p>

        {/* Headline — character-stagger reveal with display font (Syne) */}
        <h1
          className="font-display font-bold leading-[1.05] tracking-tight text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-fg-base"
          style={{ perspective: '800px' }}
        >
          <AnimatedText text={content.headlineLine1 + ' '} delay={0.2} />
          <AnimatedText
            text={content.headlineLine2}
            delay={0.2 + (content.headlineLine1.length + 1) * 0.025}
            className="text-transparent bg-clip-text"
            charStyle={{
              backgroundImage: 'linear-gradient(135deg, var(--node-color) 0%, oklch(72% 0.2 285) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          />
        </h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-fg-muted font-sans font-normal leading-relaxed max-w-2xl"
        >
          {content.subhead}
        </motion.p>

        {/* CTA — Magnetic button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <MagneticButton
            href="#algorithms"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[oklch(57%_0.18_264)] to-[oklch(60%_0.2_290)] text-white shadow-lg shadow-[oklch(57%_0.18_264)]/25 hover:shadow-[oklch(57%_0.18_264)]/40 hover:-translate-y-0.5 text-sm font-semibold font-sans tracking-wide transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(57%_0.18_264)] focus-visible:ring-offset-2"
          >
            {content.cta}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ── Scroll cue (fades out on first scroll) ───────────────────────── */}
      <AnimatePresence>
        {showScrollCue && (
          <motion.div
            key="scroll-cue"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 1.2, duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
            aria-hidden="true"
          >
            <motion.div
              animate={prefersReduced ? {} : { y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown
                size={22}
                className="text-fg-subtle opacity-60"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

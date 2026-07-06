'use client';

/**
 * OverviewSection — answers "what will I learn here" before the card grid.
 *
 * Interactive enhancements:
 *  - 3D tilt on StatCards tied to mouse position (perspective transform)
 *  - Animated count-up number for numeric stat values
 *  - Animated gradient border that pulses on hover
 */

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { type OverviewStat, type SiteContent } from '@/lib/content';

// Stagger config: each stat fades up 80ms after the previous.
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/** Parses a value like "65%" → { prefix:'', number: 65, suffix:'%' }
 *  Returns null if it cannot extract a clear numeric portion. */
function parseNumericValue(raw: string): { prefix: string; number: number; suffix: string } | null {
  const match = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([^0-9]*)$/);
  if (!match) return null;
  return { prefix: match[1], number: parseFloat(match[2]), suffix: match[3] };
}

/** Animated counter that counts from 0 → target when it enters the viewport */
function AnimatedCounter({ value, className, style }: { value: string; className?: string; style?: React.CSSProperties }) {
  const parsed = React.useMemo(() => parseNumericValue(value), [value]);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [displayValue, setDisplayValue] = useState('0');

  // Intersection observer — trigger only once
  useEffect(() => {
    const el = nodeRef.current;
    if (!el || !parsed) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !parsed) return;
    const controls = animate(0, parsed.number, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        const formatted =
          parsed.number % 1 === 0
            ? Math.round(latest).toString()
            : latest.toFixed(1);
        setDisplayValue(parsed.prefix + formatted + parsed.suffix);
      },
    });
    return () => controls.stop();
  }, [inView, parsed]);

  if (!parsed) {
    return <span className={className} style={style}>{value}</span>;
  }

  return (
    <span ref={nodeRef} className={className} style={style} aria-label={value}>
      {inView ? displayValue : `${parsed.prefix}0${parsed.suffix}`}
    </span>
  );
}

/** Stat card with 3D tilt + animated gradient border on hover */
function StatCard({ stat }: { stat: OverviewStat }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 280, damping: 28 });
  const glowX = useTransform(mouseX, [0, 1], [0, 100]);
  const glowY = useTransform(mouseY, [0, 1], [0, 100]);

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  };

  return (
    <motion.div
      variants={itemVariants}
      ref={cardRef}
      className="relative"
      style={{ perspective: 700 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl z-0 pointer-events-none"
        animate={isHovered
          ? { opacity: 1 }
          : { opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: `radial-gradient(circle at 50% 50%, oklch(57% 0.18 264 / 0.6), oklch(60% 0.2 290 / 0.3) 60%, transparent 80%)`,
        }}
      />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="
          relative z-10
          flex flex-col gap-1.5
          px-8 py-6
          border border-border-base rounded-2xl
          bg-bg-card
          transition-shadow duration-300
        "
      >
        {/* Inner spotlight tied to mouse */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl z-0"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]: number[]) =>
                `radial-gradient(circle 130px at ${x}% ${y}%, oklch(57% 0.18 264 / 0.10), transparent 70%)`
            ),
          }}
          aria-hidden="true"
        />

        <AnimatedCounter
          value={stat.value}
          className="font-display font-bold text-3xl sm:text-4xl leading-none text-transparent bg-clip-text relative z-10"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--node-color) 0%, oklch(72% 0.2 285) 100%)' }}
        />
        <span className="text-base font-semibold text-fg-base font-sans relative z-10">{stat.label}</span>
        <span className="text-sm text-fg-muted font-sans leading-snug relative z-10">{stat.detail}</span>
      </motion.div>
    </motion.div>
  );
}

interface Props {
  content: SiteContent['overview'];
}

export function OverviewSection({ content }: Props) {
  return (
    <section
      id="overview"
      aria-label="What you'll learn"
      className="relative py-28 px-6 bg-bg-subtle border-y border-border-subtle"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-16">
        {/* ── Trilemma framing ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-fg-subtle mb-4 font-sans">
            {content.trilemmaEyebrow}
          </p>
          {/* Using a dangerouslySetInnerHTML or simple replacement for the bold tags from YAML */}
          <p
            className="text-2xl sm:text-3xl font-sans font-normal leading-relaxed text-fg-base"
            dangerouslySetInnerHTML={{
              __html: content.trilemmaBody.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-fg-base">$1</span>'),
            }}
          />
        </motion.div>

        {/* ── Stat callouts — stagger-revealed on scroll ────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          aria-label="Key statistics"
        >
          {content.stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

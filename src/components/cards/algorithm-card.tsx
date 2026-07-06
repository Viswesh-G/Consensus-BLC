'use client';

/**
 * AlgorithmCard — interactive card showing algorithm details.
 *
 * Interactive enhancements:
 *  - Mouse-tracking spotlight gradient that follows the cursor (glassmorphism glow)
 *  - Ripple wave emanating from click point
 *  - Framer Motion layout animation for smooth height expansion on hover/focus
 *  - Subtle 3D tilt (perspective) tied to cursor position within the card
 */

import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type AlgorithmEntry } from '@/lib/content';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
  algorithm: AlgorithmEntry;
  ctaText: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function AlgorithmCard({ algorithm, ctaText }: Props) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Spotlight position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D tilt: map cursor position to rotateX/Y
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 300, damping: 30 });

  // Dynamically resolve the lucide icon by name
  const IconComponent = (LucideIcons as any)[algorithm.icon] || LucideIcons.HelpCircle;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    mouseX.set(relX);
    mouseY.set(relY);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsExpanded(false);
  }, [mouseX, mouseY]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 700);
    router.push(`/algorithms/${algorithm.slug}`);
  };

  // Spotlight follows mouse — expressed as a CSS background-position
  const spotlightBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]: number[]) =>
      `radial-gradient(circle 200px at ${x * 100}% ${y * 100}%, oklch(57% 0.18 264 / 0.12), transparent 70%)`
  );

  return (
    <motion.div
      layout
      ref={cardRef}
      className="relative flex h-full"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsExpanded(true)}
      onBlur={() => setIsExpanded(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative flex flex-col w-full"
        transition={{ duration: 0.15 }}
      >
        {/* Spotlight overlay — top layer, pointer-events none */}
        <motion.div
          className="absolute inset-0 z-10 rounded-[inherit] pointer-events-none"
          style={{ background: spotlightBackground }}
          aria-hidden="true"
        />

        <Card
          className="
            relative flex flex-col w-full overflow-hidden
            bg-bg-card border-border-base shadow-sm
            hover:border-[oklch(57%_0.18_264)/40] hover:shadow-md hover:shadow-[oklch(57%_0.18_264)/8]
            transition-colors duration-200 cursor-pointer
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(57%_0.18_264)]
          "
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push(`/algorithms/${algorithm.slug}`);
            }
          }}
        >
          {/* Ripple effects */}
          {ripples.map((r) => (
            <span
              key={r.id}
              className="pointer-events-none absolute rounded-full bg-[oklch(57%_0.18_264)/20] animate-ripple"
              style={{
                left: r.x - 60,
                top: r.y - 60,
                width: 120,
                height: 120,
              }}
            />
          ))}

          <motion.div layout="position" className="flex flex-col p-6 gap-4">
            <div className="flex items-start justify-between gap-4">
              <motion.div
                className="p-2.5 rounded-xl bg-bg-subtle text-fg-muted"
                animate={isExpanded
                  ? { backgroundColor: 'oklch(57% 0.18 264 / 0.12)', color: 'oklch(57% 0.18 264)' }
                  : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-fg-muted)' }}
                transition={{ duration: 0.25 }}
              >
                <IconComponent size={24} strokeWidth={1.5} />
              </motion.div>
              {/* Category Badge uses semantic CSS classes defined in globals.css */}
              <Badge
                variant="outline"
                className={`badge-${algorithm.category.replace(/\s+/g, '-').toLowerCase()} border bg-transparent font-medium`}
              >
                {algorithm.category}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold font-display text-fg-base tracking-tight">
                {algorithm.name}
              </h3>
              <p className="text-sm font-sans text-fg-muted leading-relaxed">
                {algorithm.shortTagline}
              </p>
            </div>
          </motion.div>

          {/* Expanded Content */}
          <motion.div
            className="px-6 pb-6 overflow-hidden flex flex-col gap-5"
            initial={false}
            animate={{
              height: isExpanded ? 'auto' : 0,
              opacity: isExpanded ? 1 : 0,
              marginTop: isExpanded ? 4 : 0,
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-[1px] w-full bg-border-base" />

            <p className="text-sm font-sans text-fg-subtle leading-relaxed">
              {algorithm.hoverDescription}
            </p>

            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Adopters
              </span>
              <p className="text-sm font-sans text-fg-base font-medium">
                {algorithm.adopters}
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full justify-between mt-2 bg-[oklch(57%_0.18_264)/8] text-[oklch(45%_0.18_264)] dark:text-[oklch(70%_0.18_264)] hover:bg-[oklch(57%_0.18_264)] hover:text-white transition-all duration-200 group/btn pointer-events-none"
            >
              <span className="font-semibold">{ctaText}</span>
              <LucideIcons.ArrowRight
                size={16}
                className="transform transition-transform group-hover/btn:translate-x-1"
              />
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

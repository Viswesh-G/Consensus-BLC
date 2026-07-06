'use client';

/**
 * AlgorithmGrid — the responsive grid container for the interactive cards.
 * Uses Framer Motion's LayoutGroup to ensure sibling cards reflow smoothly
 * when one card expands on hover, preventing abrupt layout shifts.
 */

import { motion, LayoutGroup } from 'motion/react';
import { type SiteContent, type AlgorithmEntry } from '@/lib/content';
import { AlgorithmCard } from './algorithm-card';

// Stagger the initial entry of the cards
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Props {
  content: SiteContent['grid'];
  algorithms: AlgorithmEntry[];
}

export function AlgorithmGrid({ content, algorithms }: Props) {
  return (
    <section
      id="algorithms"
      className="py-24 px-6 relative"
      aria-label="Algorithm Directory"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-fg-base tracking-tight">
            {content.title}
          </h2>
          <p className="text-lg text-fg-muted font-sans max-w-2xl">
            {content.description}
          </p>
        </div>

        {/* LayoutGroup shares layout animation state across all children.
            When one card grows, the grid gracefully adjusts its siblings. */}
        <LayoutGroup>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start"
          >
            {algorithms.map((algo) => (
              <AlgorithmCard key={algo.slug} algorithm={algo} ctaText={content.cta} />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}

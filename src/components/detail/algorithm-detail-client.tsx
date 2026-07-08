'use client';

/**
 * AlgorithmDetailPage client wrapper — adds interactive entry animations,
 * data-driven tradeoff visualization, coins used, and the full detail description.
 */

import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Coins, Layers } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { type AlgorithmEntry, type TradeoffDetail } from '@/lib/content';
import { Badge } from '@/components/ui/badge';

/** Animated bar for a single tradeoff metric */
function TradeoffBar({
  label,
  detail,
  color,
  delay,
}: {
  label: string;
  detail: TradeoffDetail;
  color: string;
  delay: number;
}) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-bg-subtle border border-border-base">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold font-sans text-fg-base">{label}</span>
        <span className="text-sm font-bold font-display" style={{ color }}>
          {detail.score}/10
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-base overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${detail.score * 10}%` }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="text-xs font-sans text-fg-muted leading-relaxed">{detail.why}</p>
    </div>
  );
}

interface Props {
  algorithm: AlgorithmEntry;
  related: AlgorithmEntry[];
  content: {
    backLink: string;
    placeholderHeading: string;
    placeholderBody: string;
    adoptersHeading: string;
    coinsHeading: string;
    tradeoffsHeading: string;
    exploreMoreHeading: string;
  };
}

export function AlgorithmDetailClient({ algorithm, related, content }: Props) {
  const IconComponent = (LucideIcons as any)[algorithm.icon] || LucideIcons.HelpCircle;

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-fg-base">
      <header className="px-6 py-8 md:py-12 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted hover:text-fg-base transition-colors mb-12 group"
          >
            <motion.span
              className="inline-flex"
              animate={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <ArrowLeft size={16} />
            </motion.span>
            {content.backLink}
          </Link>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="p-3 rounded-2xl bg-bg-subtle"
              style={{ color: 'oklch(57% 0.18 264)' }}
              initial={{ scale: 0.6, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <IconComponent size={32} strokeWidth={1.5} />
            </motion.div>
            <Badge
              variant="outline"
              className={`badge-${algorithm.category.replace(/\s+/g, '-').toLowerCase()} border bg-transparent font-medium`}
            >
              {algorithm.category}
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {algorithm.name}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-fg-muted font-sans max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {algorithm.shortTagline}
          </motion.p>
        </div>
      </header>

      <main className="flex-1 px-6 max-w-4xl mx-auto w-full flex flex-col gap-12 pb-24">

        {/* ── How It Works (Detail Description) ── */}
        <motion.section
          className="bg-bg-card border border-border-base rounded-2xl p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-4">
            How it works
          </p>
          <p className="text-base text-fg-base font-sans leading-relaxed whitespace-pre-line">
            {algorithm.detailDescription}
          </p>
        </motion.section>

        {/* ── Trade-off Analysis ── */}
        <motion.section
          className="bg-bg-card border border-border-base rounded-2xl p-8 flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-1">
              {content.tradeoffsHeading}
            </p>
            <h2 className="text-xl font-display font-bold text-fg-base">
              Decentralization · Immutability · Transparency · Security
            </h2>
            <p className="text-sm text-fg-muted mt-1">
              How this mechanism performs across the four core blockchain properties — and why.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TradeoffBar
              label="Decentralization"
              detail={algorithm.tradeoffs.decentralization}
              color="oklch(57% 0.18 264)"
              delay={0.45}
            />
            <TradeoffBar
              label="Immutability"
              detail={algorithm.tradeoffs.immutability}
              color="oklch(55% 0.18 145)"
              delay={0.5}
            />
            <TradeoffBar
              label="Transparency"
              detail={algorithm.tradeoffs.transparency}
              color="oklch(60% 0.18 60)"
              delay={0.55}
            />
            <TradeoffBar
              label="Security"
              detail={algorithm.tradeoffs.security}
              color="oklch(58% 0.18 25)"
              delay={0.6}
            />
          </div>
        </motion.section>

        {/* ── Layer 1 & Layer 2 Coins ── */}
        <motion.section
          className="bg-bg-card border border-border-base rounded-2xl p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-fg-subtle mb-4">
            {content.coinsHeading}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-fg-muted mb-1">
                <Layers size={16} strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-wider">Layer 1</span>
              </div>
              <p className="text-sm font-sans text-fg-base leading-relaxed">
                {algorithm.layer1Coins}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-fg-muted mb-1">
                <Coins size={16} strokeWidth={1.5} />
                <span className="text-xs font-bold uppercase tracking-wider">Layer 2</span>
              </div>
              <p className="text-sm font-sans text-fg-base leading-relaxed">
                {algorithm.layer2Coins}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Adopters ── */}
        <motion.section
          className="bg-bg-card border border-border-base rounded-xl p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-fg-muted mb-2">
            {content.adoptersHeading}
          </h3>
          <p className="font-medium text-lg">{algorithm.adopters}</p>
        </motion.section>

        <hr className="border-border-base my-4" />

        {/* ── Related Strip ── */}
        <section className="flex flex-col gap-6">
          <motion.h3
            className="text-2xl font-display font-bold"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {content.exploreMoreHeading}
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((rel, i) => {
              const RelIcon = (LucideIcons as any)[rel.icon] || LucideIcons.HelpCircle;
              return (
                <motion.div
                  key={rel.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.55 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={`/algorithms/${rel.slug}`}
                    className="group flex flex-col gap-4 p-6 border border-border-base rounded-xl bg-bg-card hover:border-[oklch(57%_0.18_264)/40] hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 text-fg-muted group-hover:text-[oklch(57%_0.18_264)] transition-colors">
                      <RelIcon size={20} strokeWidth={1.5} />
                      <span className="font-semibold font-display tracking-tight text-fg-base">
                        {rel.name}
                      </span>
                    </div>
                    <p className="text-sm text-fg-muted line-clamp-2">
                      {rel.shortTagline}
                    </p>
                    <div className="flex items-center gap-2 mt-auto pt-2 text-sm font-semibold text-[oklch(57%_0.18_264)] group-hover:gap-3 transition-all">
                      Read story
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

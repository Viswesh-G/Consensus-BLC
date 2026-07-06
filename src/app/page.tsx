import { HeroSection } from '@/components/hero/hero-section';
import { OverviewSection } from '@/components/overview/overview-section';
import { AlgorithmGrid } from '@/components/cards/algorithm-grid';
import { StickyHeader } from '@/components/sticky-header';
import { CursorLoader } from '@/components/ui/cursor-loader';
import { getContent } from '@/lib/content';

export default function HomePage() {
  const content = getContent();

  return (
    <>
      {/* Global custom cursor (client-only, hidden on touch devices automatically) */}
      <CursorLoader />

      {/* ── Animated sticky header ───────────────────────────────────────── */}
      <StickyHeader header={content.global.header} />

      <main className="flex flex-col w-full">
        <HeroSection content={content.hero} />
        <OverviewSection content={content.overview} />
        <AlgorithmGrid content={content.grid} algorithms={content.algorithms} />
      </main>
    </>
  );
}

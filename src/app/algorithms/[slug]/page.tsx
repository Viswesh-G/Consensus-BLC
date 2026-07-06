import { notFound } from 'next/navigation';
import { getAlgorithms, getContent } from '@/lib/content';
import { AlgorithmDetailClient } from '@/components/detail/algorithm-detail-client';

// Pre-render all known slugs at build time
export async function generateStaticParams() {
  const algorithms = getAlgorithms();
  return algorithms.map((algo) => ({
    slug: algo.slug,
  }));
}

// Next.js 15 app router signature — params is a promise
export default async function AlgorithmDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const algorithms = getAlgorithms();
  const content = getContent().detailPage;

  const algorithm = algorithms.find((a) => a.slug === slug);
  if (!algorithm) {
    notFound();
  }

  // Find 2 related algorithms (same category first, fallback to any other)
  const related = algorithms
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      if (a.category === algorithm.category) return -1;
      if (b.category === algorithm.category) return 1;
      return 0;
    })
    .slice(0, 2);

  return (
    <AlgorithmDetailClient
      algorithm={algorithm}
      related={related}
      content={content}
    />
  );
}

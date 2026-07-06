'use client';

import dynamic from 'next/dynamic';

const CustomCursor = dynamic(
  () => import('@/components/ui/custom-cursor').then((m) => m.CustomCursor),
  { ssr: false }
);

export function CursorLoader() {
  return <CustomCursor />;
}

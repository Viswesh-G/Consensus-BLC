'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  // Mounted state prevents hydration mismatch — render nothing on server.
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Reserve space so layout doesn't shift on mount
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      id="theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        relative flex items-center justify-center w-9 h-9 rounded-lg
        text-fg-muted hover:text-fg-base
        hover:bg-bg-subtle
        border border-transparent hover:border-border-base
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
      "
    >
      {isDark ? (
        <Sun size={16} strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}

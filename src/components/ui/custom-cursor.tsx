'use client';

/**
 * CustomCursor — a trailing dot + ring cursor that replaces the browser default.
 * Uses two separate elements: a fast-tracking dot and a slower-trailing ring.
 * mix-blend-mode: difference inverts colours under the cursor for visibility in both themes.
 *
 * Hides automatically on touch devices. Respects prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from 'motion/react';

export function CustomCursor() {
  const prefersReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isDown, setIsDown] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Ring trails behind dot with spring inertia
  const springX = useSpring(cursorX, { stiffness: 120, damping: 20, mass: 0.4 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 20, mass: 0.4 });

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      const target = e.target as Element;
      const isClickable =
        target.closest('a, button, [role="button"], input, select, textarea, [tabindex]') !== null;
      setIsPointer(isClickable);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);
    const onDown = () => setIsDown(true);
    const onUp = () => setIsDown(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);

    // Hide native cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
    };
  }, [cursorX, cursorY]);

  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Fast-tracking inner dot */}
          <motion.div
            className="cursor-dot"
            style={{
              x: cursorX,
              y: cursorY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: isDown ? 0.5 : isPointer ? 1.5 : 1,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'white',
              }}
            />
          </motion.div>

          {/* Slower ring */}
          <motion.div
            className="cursor-dot"
            style={{
              x: springX,
              y: springY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.6,
              scale: isDown ? 0.7 : isPointer ? 1.8 : 1,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1.5px solid white',
                transition: 'width 0.2s, height 0.2s',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

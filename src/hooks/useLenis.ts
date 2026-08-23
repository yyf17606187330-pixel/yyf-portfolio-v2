import { useEffect } from 'react';
import Lenis from 'lenis';
import { useMediaQuery } from './useMediaQuery';

export function useLenis() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.86,
    });
    let frame = 0;

    const update = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reducedMotion]);
}

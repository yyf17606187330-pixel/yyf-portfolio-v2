import { useLayoutEffect } from 'react';

interface BodyStyleSnapshot {
  overflow: string;
  position: string;
  top: string;
  width: string;
}

export function useScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) {
      return undefined;
    }

    const scrollPosition = window.scrollY;
    const snapshot: BodyStyleSnapshot = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = snapshot.overflow;
      document.body.style.position = snapshot.position;
      document.body.style.top = snapshot.top;
      document.body.style.width = snapshot.width;

      if (scrollPosition !== 0) {
        window.scrollTo({ top: scrollPosition, left: 0, behavior: 'auto' });
      }
    };
  }, [active]);
}

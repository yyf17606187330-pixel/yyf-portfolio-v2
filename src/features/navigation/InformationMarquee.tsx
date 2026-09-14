import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './InformationMarquee.css';

interface InformationMarqueeProps {
  label: string;
  items: readonly string[];
  paused?: boolean;
  tone?: 'paper' | 'inverse';
}

export function InformationMarquee({
  label,
  items,
  paused = false,
  tone = 'paper',
}: InformationMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [manualPause, setManualPause] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <div
      aria-label={label}
      className={`information-marquee information-marquee--${tone}`}
      data-paused={paused || manualPause || !inView || !pageVisible || reducedMotion}
      data-reduced-motion={reducedMotion}
      ref={rootRef}
      role="region"
    >
      <div className="information-marquee__window">
        <div className="information-marquee__track">
          {[false, true].map((duplicate) => (
            <ul
              aria-hidden={duplicate ? true : undefined}
              className="information-marquee__group"
              key={String(duplicate)}
            >
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ))}
        </div>
      </div>
      {!reducedMotion ? (
        <button
          aria-label={`${manualPause ? '继续' : '暂停'}${label}轮播`}
          aria-pressed={manualPause}
          className="information-marquee__toggle"
          onClick={() => setManualPause((value) => !value)}
          type="button"
        >
          {manualPause ? '继续' : '暂停'}
        </button>
      ) : null}
    </div>
  );
}

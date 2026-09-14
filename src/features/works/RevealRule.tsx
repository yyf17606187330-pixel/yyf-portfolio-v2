import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface RevealRuleProps {
  name: string;
}

export function RevealRule({ name }: RevealRuleProps) {
  const ruleRef = useRef<HTMLElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return undefined;
    }

    const rule = ruleRef.current;
    if (!rule || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setRevealed(true);
      observer.disconnect();
    }, {
      rootMargin: '0px 0px -16% 0px',
      threshold: 0,
    });

    observer.observe(rule);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <i
      aria-hidden="true"
      className="project-showcase__reveal-rule"
      data-reveal-rule={name}
      data-revealed={revealed ? 'true' : 'false'}
      ref={ruleRef}
    />
  );
}

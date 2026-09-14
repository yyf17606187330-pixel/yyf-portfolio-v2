import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import gsap from 'gsap';
import type { AboutContent } from '../../content/about';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './SkillCards.css';

interface SkillCardsProps {
  groups: AboutContent['capabilityGroups'];
  paused?: boolean;
  children?: ReactNode;
}

export function SkillCards({ groups, paused = false, children }: SkillCardsProps) {
  const [selectedId, setSelectedId] = useState(groups[0]?.id);
  const selected = groups.find((group) => group.id === selectedId) ?? groups[0];
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const inViewRef = useRef(false);
  const completedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const panelId = useId();
  const headingId = useId();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (reducedMotion || completedRef.current || typeof IntersectionObserver === 'undefined') {
      root.dataset.entered = 'true';
      return undefined;
    }
    const sync = () => {
      animationRef.current?.paused(!inViewRef.current || pausedRef.current || document.visibilityState !== 'visible');
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    const context = gsap.context(() => {
      root.dataset.entered = 'false';
      animationRef.current = gsap.fromTo(root.querySelectorAll('.skill-card__select'), { y: 24 }, {
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.065,
        paused: true,
        clearProps: 'transform',
        onComplete: () => {
          completedRef.current = true;
          root.dataset.entered = 'true';
          observer.unobserve(root);
        },
      });
    }, root);
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      context.revert();
      animationRef.current = null;
    };
  }, [groups, reducedMotion]);

  useEffect(() => {
    animationRef.current?.paused(!inViewRef.current || paused || document.visibilityState !== 'visible');
  }, [paused]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = groups.length - 1;
    else if (event.key in offsets) next = (index + offsets[event.key] + groups.length) % groups.length;
    else return;
    event.preventDefault();
    setSelectedId(groups[next].id);
    buttonsRef.current[next]?.focus();
  };

  if (!selected) return null;

  return (
    <div className="skill-collage" ref={rootRef}>
      <div className="skill-collage__stage">
        <img
          alt=""
          aria-hidden="true"
          className="skill-collage__backdrop"
          decoding="async"
          height="1024"
          loading="lazy"
          src="/assets/about/collage-paper-stage.webp"
          width="1536"
        />
        {children ? <div className="skill-collage__portrait">{children}</div> : null}
        <ol aria-label="能力范围" className="skill-cards">
          {groups.map((group, index) => (
            <li className="skill-card" data-skill-card={group.id} key={group.id}>
              <button
                aria-controls={panelId}
                aria-label={group.title}
                aria-pressed={selected.id === group.id}
                className="skill-card__select"
                onClick={() => setSelectedId(group.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                ref={(button) => { buttonsRef.current[index] = button; }}
                type="button"
              >
                <span aria-hidden="true" className="skill-card__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="skill-card__title">{group.title}</span>
                <span aria-hidden="true" className="skill-card__mark">{selected.id === group.id ? '−' : '+'}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div aria-atomic="true" aria-labelledby={headingId} aria-live="polite" className="skill-detail" id={panelId} role="region">
        <div className="skill-detail__heading">
          <p>SKILL NOTES / {String(groups.indexOf(selected) + 1).padStart(2, '0')}</p>
          <h4 id={headingId}>{selected.title}</h4>
        </div>
        <div className="skill-detail__body">
          <p>{selected.description}</p>
          <ul aria-label={selected.title + '技能'} className="skill-detail__tags">
            {selected.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        {selected.evidence ? (
          <a aria-label={selected.evidence.label + '：' + selected.title} className="skill-detail__evidence" href={selected.evidence.href}>
            {selected.evidence.label}<span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

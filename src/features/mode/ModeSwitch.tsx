import { ArrowIcon } from '../navigation/ArrowIcon';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import './ModeSwitch.css';

type Mode = 'minimal' | 'p5';
const transitionKey = 'yyf-mode-transition';
const targetFor = (mode: Mode) => mode === 'p5' ? '/p5/' : '/';

function arrivingIn(mode: Mode) {
  try {
    const value = JSON.parse(sessionStorage.getItem(transitionKey) ?? 'null');
    return value?.target === targetFor(mode) && Date.now() - value.time < 15000;
  } catch { return false; }
}

export function ModeSwitch({ mode, hidden = false, navigate = (url: string) => window.location.assign(url) }: {
  mode: Mode; hidden?: boolean; navigate?: (url: string) => void;
}) {
  const [phase, setPhase] = useState<'idle' | 'leaving' | 'arriving'>(() => arrivingIn(mode) ? 'arriving' : 'idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigating = useRef(false);
  const target = mode === 'minimal' ? '/p5/' : '/';
  const label = mode === 'minimal' ? '解锁隐藏模式' : '返回简约模式';

  useEffect(() => {
    if (arrivingIn(mode)) {
      // This also skips a second HELLO when returning from P5.
      try { sessionStorage.setItem('yyf-paper-intro-seen', '1'); } catch { /* optional storage */ }
      timer.current = setTimeout(() => {
        setPhase('idle');
        try { sessionStorage.removeItem(transitionKey); } catch { /* optional storage */ }
      }, 650);
    }
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) { navigating.current = false; setPhase('idle'); }
    };
    window.addEventListener('pageshow', restore);
    return () => { clearTimeout(timer.current); window.removeEventListener('pageshow', restore); };
  }, [mode]);

  function switchMode(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;
    const go = () => {
      try {
        sessionStorage.setItem(transitionKey, JSON.stringify({ target, time: Date.now() }));
        sessionStorage.setItem('yyf-paper-intro-seen', '1');
      } catch { /* Navigation must work when storage is disabled. */ }
      navigate(target);
    };
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { go(); return; }
    setPhase('leaving');
    timer.current = setTimeout(go, 420);
  }

  return <>
    {!hidden && <a className="mode-switch" data-text-reveal-skip data-mode={mode} href={target} onClick={switchMode}
      aria-label={label} aria-busy={phase === 'leaving' || undefined}>
      <svg className="mode-switch__mask" viewBox="0 0 48 40" aria-hidden="true">
        <path className="mode-switch__paper" d="M3 5 23 10 45 3 41 26 25 37 7 28Z" />
        <path className="mode-switch__ink" d="m24 10 21-7-4 23-16 11-3-15Z" />
        <path className="mode-switch__eye-dark" d="m8 15 12 2-4 6-6-2Z" />
        <path className="mode-switch__eye-light" d="m28 17 12-4-3 8-6 2Z" />
      </svg>
      <span>{label}</span><span className="mode-switch__arrow" aria-hidden="true"><ArrowIcon /></span>
    </a>}
    {phase !== 'idle' && createPortal(
      <div className="mode-transition" data-phase={phase} data-mode={mode} role="status" aria-live="polite">
        <div className="mode-transition__panel"><span>{phase === 'leaving'
          ? (mode === 'minimal' ? '隐藏模式' : '简约模式')
          : (mode === 'p5' ? '隐藏模式' : '简约模式')}</span></div>
      </div>, document.body)}
  </>;
}

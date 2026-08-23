import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { markIntroPlayed, shouldPlayIntro } from '../../lib/sessionIntro';

interface IntroSequenceProps {
  onComplete: () => void;
}

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [visible, setVisible] = useState(() => shouldPlayIntro(window.sessionStorage, reducedMotion));
  const rootRef = useRef<HTMLDivElement>(null);
  const helloRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const completedRef = useRef(false);

  const complete = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    markIntroPlayed(window.sessionStorage);
    setVisible(false);
    onComplete();
  }, [onComplete]);

  const modalActive = visible && !reducedMotion;
  useScrollLock(modalActive);
  useFocusTrap(rootRef, modalActive, complete, skipRef);

  useEffect(() => {
    if (reducedMotion || !shouldPlayIntro(window.sessionStorage, reducedMotion)) {
      complete();
    }
  }, [complete, reducedMotion]);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!visible || reducedMotion || !root) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: complete });

      timeline
        .set(helloRef.current, { autoAlpha: 0, y: 28 })
        .set(nameRef.current, { autoAlpha: 0, y: 32 })
        .to(helloRef.current, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power3.out' }, 0)
        .to(helloRef.current, { autoAlpha: 0, y: -22, duration: 0.25, ease: 'power3.in' }, 0.55)
        .to(nameRef.current, { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out' }, 0.7)
        .to(nameRef.current, { autoAlpha: 0, y: -24, duration: 0.24, ease: 'power3.in' }, 1.25)
        .to(root, { autoAlpha: 0, duration: 0.2, ease: 'power2.inOut' }, 1.45);
    }, root);

    return () => context.revert();
  }, [complete, reducedMotion, visible]);

  if (!visible || reducedMotion) {
    return null;
  }

  return createPortal(
    <div
      aria-label="开场动画"
      aria-modal="true"
      className="intro-sequence"
      ref={rootRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="intro-sequence__copy" aria-live="polite">
        <p className="intro-sequence__line" ref={helloRef}>HELLO.</p>
        <p className="intro-sequence__line intro-sequence__line--name" ref={nameRef}>YANG YUFENG</p>
      </div>
      <button className="intro-sequence__skip" ref={skipRef} type="button" onClick={complete}>
        跳过开场
      </button>
    </div>,
    document.body,
  );
}

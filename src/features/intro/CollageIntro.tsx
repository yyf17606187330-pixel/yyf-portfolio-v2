import { ArrowIcon } from '../navigation/ArrowIcon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { useScrollLock } from '../../hooks/useScrollLock';
import { rememberIntro } from './introSession';
import './CollageIntro.css';

interface CollageIntroProps {
  heroPoster: string;
  heroVideoReady?: boolean;
  onReveal?: () => void;
  onComplete: () => void;
}

export function CollageIntro({ heroPoster, heroVideoReady = true, onReveal, onComplete }: CollageIntroProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pageVisible = usePageVisibility();
  const finish = useCallback(() => setClosing(true), []);

  useScrollLock(true);
  useFocusTrap(dialogRef, true, finish);

  useEffect(() => {
    const poster = new Image();
    let disposed = false;
    const settle = () => { if (!disposed) setHeroReady(true); };
    const decode = () => {
      if (typeof poster.decode === 'function') void poster.decode().then(settle, settle);
      else settle();
    };
    poster.onload = decode;
    poster.onerror = settle;
    poster.src = heroPoster;
    if (poster.complete) decode();
    const minimum = window.setTimeout(() => setMinimumElapsed(true), 2400);
    const deadline = window.setTimeout(finish, 5000);
    return () => {
      disposed = true;
      poster.onload = null;
      poster.onerror = null;
      window.clearTimeout(minimum);
      window.clearTimeout(deadline);
    };
  }, [finish, heroPoster]);

  useEffect(() => {
    if (reducedMotion || (minimumElapsed && heroReady && heroVideoReady)) finish();
  }, [finish, heroReady, heroVideoReady, minimumElapsed, reducedMotion]);

  useEffect(() => {
    if (!closing) return undefined;
    // Start the text entrance while the opaque curtain is moving away.
    const reveal = window.setTimeout(() => onReveal?.(), reducedMotion ? 0 : 400);
    const exit = window.setTimeout(() => {
      rememberIntro();
      onComplete();
    }, reducedMotion ? 0 : 1050);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(exit);
    };
  }, [closing, onComplete, onReveal, reducedMotion]);

  return createPortal(
    <div
      aria-labelledby="collage-intro-title"
      aria-modal="true"
      className="collage-intro"
      data-closing={closing}
      data-paused={!pageVisible}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      {/* Squiggly Text technique by Lucas Bebber (MIT); see /third-party-notices.txt. */}
      <svg className="collage-intro__filters" aria-hidden="true" focusable="false">
        <defs>
          {[0, 1, 2, 3, 4].map((frame) => (
            <filter id={`intro-pencil-${frame}`} key={frame} x="-10%" y="-20%" width="120%" height="140%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves="2" seed={frame + 3} result="pencil-noise" />
              <feDisplacementMap in="SourceGraphic" in2="pencil-noise" scale={frame % 2 ? 9 : 7} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          ))}
        </defs>
      </svg>
      <div className="collage-intro__topline">
        <span>YANG YUFENG / PORTFOLIO</span>
        <button className="collage-intro__skip" onClick={finish} type="button">
          跳过片头 <span aria-hidden="true"><ArrowIcon /></span>
        </button>
      </div>
      {(['top', 'bottom'] as const).map((edge) => (
        <div className={`collage-intro__ribbon collage-intro__ribbon--${edge}`} key={edge} aria-hidden="true">
          <div className="collage-intro__ribbon-track" />
        </div>
      ))}
      <div className="collage-intro__stage">
        <h2 id="collage-intro-title" className="collage-intro__hello" aria-label="HELLO">
          {'HELLO'.split('').map((letter, index) => (
            <span aria-hidden="true" key={index}>{letter}</span>
          ))}
        </h2>
      </div>
      <span className="collage-intro__status" role="status">{closing ? '开始浏览' : '正在准备首页'}</span>
    </div>,
    document.body,
  );
}

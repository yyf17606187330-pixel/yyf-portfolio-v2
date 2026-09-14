import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { aiVideoCapabilityItems } from '../../content/aiVideoCapability';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';
import { rememberIntro } from './introSession';
import './CollageIntro.css';

const collage = aiVideoCapabilityItems.find((item) => item.placement === 'intro')!;

interface CollageIntroProps {
  heroPoster: string;
  heroVideoReady?: boolean;
  onComplete: () => void;
}

export function CollageIntro({ heroPoster, heroVideoReady = true, onComplete }: CollageIntroProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [closing, setClosing] = useState(false);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
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
    const video = videoRef.current;
    if (!video) return undefined;
    const sync = () => {
      if (document.visibilityState === 'visible' && !closing) {
        void video.play().catch(() => setMediaReady(true));
      } else {
        video.pause();
      }
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      video.pause();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [closing, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || (minimumElapsed && heroReady && heroVideoReady && mediaReady)) finish();
  }, [finish, heroReady, heroVideoReady, mediaReady, minimumElapsed, reducedMotion]);

  useEffect(() => {
    if (!closing) return undefined;
    const exit = window.setTimeout(() => {
      rememberIntro();
      onComplete();
    }, reducedMotion ? 0 : 420);
    return () => window.clearTimeout(exit);
  }, [closing, onComplete, reducedMotion]);

  return createPortal(
    <div
      aria-labelledby="collage-intro-title"
      aria-modal="true"
      className="collage-intro"
      data-closing={closing}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="collage-intro__topline">
        <span>YANG YUFENG / PORTFOLIO</span>
        <button className="collage-intro__skip" onClick={finish} type="button">
          跳过片头 <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className="collage-intro__title">
        <p>影像 · 内容 · AI</p>
        <h2 id="collage-intro-title"><span>让想法</span><span>成为画面。</span></h2>
        <span className="collage-intro__edition">SELECTED WORKS / 2022—2026</span>
      </div>
      <div className="collage-intro__loading">
        <div className="collage-intro__film" aria-hidden="true">
          {reducedMotion ? (
            <img alt="" src={resolveMediaUrl(collage.poster!) ?? undefined} />
          ) : (
            <video
              aria-hidden="true"
              loop
              muted
              onCanPlay={() => setMediaReady(true)}
              onError={() => setMediaReady(true)}
              playsInline
              poster={resolveMediaUrl(collage.poster!) ?? undefined}
              preload="auto"
              ref={videoRef}
              src={resolveMediaUrl(collage.previewSrc!) ?? undefined}
            />
          )}
        </div>
        <div className="collage-intro__status" role="status">
          <span className="collage-intro__spinner" aria-hidden="true" />
          <span>{closing ? 'READY' : 'LOADING'}<small>{closing ? '开始浏览' : '画面即将展开'}</small></span>
        </div>
      </div>
      <span className="collage-intro__folio" aria-hidden="true">01 / OPENING</span>
    </div>,
    document.body,
  );
}

import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { getCategoryLabel } from '../../content/categories';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';
import { initialPlayerState, playerReducer } from './playerState';

interface PlayerOverlayProps {
  project: Project | null;
  opener: HTMLElement | null;
  onClose: () => void;
}

interface WebkitFullscreenVideo extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '00:00';
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PlayerOverlay({ project, opener, onClose }: PlayerOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackGenerationRef = useRef(0);
  const activeSlugRef = useRef<string | null>(null);
  const [playerState, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mediaUrl = resolveMediaUrl(project?.fullSrc ?? '');
  const posterUrl = resolveMediaUrl(project?.poster ?? '');
  const open = project !== null;
  const handleClose = useCallback(() => onClose(), [onClose]);
  const isPlaying = playerState.isPlaying;
  const isMuted = playerState.isMuted;

  const isCurrentVideo = useCallback((video: HTMLVideoElement, slug: string) => (
    videoRef.current === video && activeSlugRef.current === slug
  ), []);

  const attemptPlayback = useCallback((video: HTMLVideoElement, slug: string, generation: number) => {
    const settle = (type: 'playing' | 'paused') => {
      if (playbackGenerationRef.current === generation && isCurrentVideo(video, slug)) {
        dispatch({ type });
      }
    };

    try {
      void video.play().then(
        () => settle('playing'),
        () => settle('paused'),
      );
    } catch {
      settle('paused');
    }
  }, [isCurrentVideo]);

  useScrollLock(open);
  useFocusTrap(dialogRef, open, handleClose, closeRef, opener);

  useLayoutEffect(() => {
    const slug = project?.slug ?? null;
    const generation = ++playbackGenerationRef.current;
    activeSlugRef.current = slug;
    setCurrentTime(0);
    setDuration(0);
    dispatch(slug ? { type: 'open', slug } : { type: 'close' });

    const video = videoRef.current;

    if (!video || !mediaUrl || !slug) {
      return () => {
        playbackGenerationRef.current += 1;
        activeSlugRef.current = null;
      };
    }

    video.muted = false;
    attemptPlayback(video, slug, generation);

    return () => {
      playbackGenerationRef.current += 1;
      activeSlugRef.current = null;
      video.pause();
    };
  }, [attemptPlayback, mediaUrl, project?.slug]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog || reducedMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      timeline
        .fromTo(dialog, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.34 }, 0)
        .fromTo(
          '.player-overlay__stage',
          { scale: 0.965, y: 22 },
          { scale: 1, y: 0, duration: 0.62, ease: 'power4.out' },
          0.06,
        )
        .fromTo(
          '.player-overlay__meta, .player-overlay__controls',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.38, stagger: 0.06 },
          0.28,
        );
    }, dialog);

    return () => context.revert();
  }, [open, project?.slug, reducedMotion]);

  if (!project) {
    return null;
  }

  const togglePlayback = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isPlaying) {
      playbackGenerationRef.current += 1;
      video.pause();
      dispatch({ type: 'paused' });
      return;
    }

    const generation = ++playbackGenerationRef.current;
    attemptPlayback(video, project.slug, generation);
  };

  const toggleMuted = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    dispatch({ type: 'toggle-muted' });
  };

  const seek = (value: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = value;
    setCurrentTime(value);
  };

  const enterFullscreen = () => {
    const video = videoRef.current as WebkitFullscreenVideo | null;

    if (!video) {
      return;
    }

    if (video.requestFullscreen) {
      void video.requestFullscreen().catch(() => undefined);
      return;
    }

    video.webkitEnterFullscreen?.();
  };

  return createPortal(
    <div
      aria-label={`播放作品：${project.title}`}
      aria-modal="true"
      className="player-overlay"
      data-lenis-prevent
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="player-overlay__topline">
        <p>PROJECT PLAYER</p>
        <button ref={closeRef} type="button" onClick={handleClose} aria-label="关闭播放器">
          CLOSE <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="player-overlay__body">
        <div className="player-overlay__stage">
          {mediaUrl ? (
            <video
              ref={videoRef}
              playsInline
              poster={posterUrl ?? undefined}
              preload="metadata"
              src={mediaUrl}
              onDurationChange={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
                }
              }}
              onEnded={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  dispatch({ type: 'paused' });
                }
              }}
              onLoadedMetadata={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
                }
              }}
              onPause={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  dispatch({ type: 'paused' });
                }
              }}
              onPlay={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  dispatch({ type: 'playing' });
                }
              }}
              onTimeUpdate={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  setCurrentTime(event.currentTarget.currentTime);
                }
              }}
            />
          ) : (
            <div className="player-overlay__missing" style={{ aspectRatio: project.aspectRatio }}>
              {posterUrl ? <img alt="" aria-hidden="true" src={posterUrl} /> : null}
              <p>作品视频待替换</p>
              <span>VIDEO SOURCE PLACEHOLDER</span>
            </div>
          )}
        </div>

        <div className="player-overlay__meta">
          <div>
            <p>{String(project.order).padStart(2, '0')} / {getCategoryLabel(project.category)}</p>
            <h2>{project.title}</h2>
          </div>
          <div>
            <p>{project.client}</p>
            <p>{project.roles.join(' · ')}</p>
            <p>{project.year}</p>
          </div>
        </div>

        {mediaUrl ? (
          <div className="player-overlay__controls" aria-label="视频控制">
            <button type="button" onClick={togglePlayback}>{isPlaying ? '暂停' : '播放'}</button>
            <span className="player-overlay__time">{formatTime(currentTime)}</span>
            <input
              aria-label="播放进度"
              max={duration || 1}
              min="0"
              step="0.1"
              type="range"
              value={Math.min(currentTime, duration || 1)}
              onChange={(event) => seek(Number(event.currentTarget.value))}
            />
            <span className="player-overlay__time">{formatTime(duration)}</span>
            <button type="button" onClick={toggleMuted}>{isMuted ? '取消静音' : '静音'}</button>
            <button type="button" onClick={enterFullscreen}>全屏</button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

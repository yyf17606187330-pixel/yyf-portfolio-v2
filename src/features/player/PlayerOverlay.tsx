import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mediaUrl = resolveMediaUrl(project?.fullSrc ?? '');
  const posterUrl = resolveMediaUrl(project?.poster ?? '');
  const open = project !== null;
  const handleClose = useCallback(() => onClose(), [onClose]);

  useScrollLock(open);
  useFocusTrap(dialogRef, open, handleClose, closeRef, opener);

  useLayoutEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsMuted(false);
    setIsPlaying(Boolean(mediaUrl));

    const video = videoRef.current;

    if (!video || !mediaUrl) {
      return;
    }

    video.muted = false;
    void video.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  }, [mediaUrl, project?.slug]);

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
      video.pause();
      setIsPlaying(false);
      return;
    }

    void video.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false),
    );
  };

  const toggleMuted = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
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
              onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
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
            <p>{String(project.order).padStart(2, '0')} / {project.category}</p>
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

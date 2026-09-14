import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { getCategoryLabel } from '../../content/categories';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';
import type { Project } from '../../types/portfolio';
import { initialPlayerState, playerReducer } from './playerState';
import './PlayerOverlay.css';

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
  const fullscreenRequestRef = useRef(0);
  const activeSlugRef = useRef<string | null>(null);
  const playbackSessionRef = useRef<string | null>(null);
  const mutedPreferenceRef = useRef(false);
  const [playerState, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fallbackSlug, setFallbackSlug] = useState<string | null>(null);
  const [playbackIssue, setPlaybackIssue] = useState<'blocked' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullscreenUnavailable, setFullscreenUnavailable] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const primaryUrl = resolveMediaUrl(project?.fullSrc ?? '');
  const fallbackUrl = resolveMediaUrl(project?.fallbackSrc ?? '');
  const usingFallback = Boolean(project && fallbackSlug === project.slug && fallbackUrl);
  const mediaUrl = usingFallback ? fallbackUrl : primaryUrl;
  const posterUrl = resolveMediaUrl(project?.poster ?? '');
  const open = project !== null;
  const handleClose = useCallback(() => {
    if (document.fullscreenElement && dialogRef.current?.contains(document.fullscreenElement)) {
      void document.exitFullscreen?.().catch(() => undefined);
    }
    onClose();
  }, [onClose]);
  const isPlaying = playerState.isPlaying;
  const isMuted = playerState.isMuted;

  const isCurrentVideo = useCallback((video: HTMLVideoElement, slug: string) => (
    videoRef.current === video && activeSlugRef.current === slug
  ), []);

  const attemptPlayback = useCallback((video: HTMLVideoElement, slug: string, generation: number) => {
    const settle = (type: 'playing' | 'paused') => {
      if (playbackGenerationRef.current === generation && isCurrentVideo(video, slug)) {
        dispatch({ type });
        setLoading(false);
        setPlaybackIssue(type === 'playing' ? null : 'blocked');
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
    setPlaybackIssue(null);
    setLoading(Boolean(slug && mediaUrl));
    setFullscreenUnavailable(false);
    if (!slug) setFallbackSlug(null);
    if (playbackSessionRef.current !== slug) {
      playbackSessionRef.current = slug;
      mutedPreferenceRef.current = false;
      dispatch(slug ? { type: 'open', slug } : { type: 'close' });
    } else {
      dispatch({ type: 'paused' });
    }

    const video = videoRef.current;

    if (!video || !mediaUrl || !slug) {
      return () => {
        playbackGenerationRef.current += 1;
        activeSlugRef.current = null;
      };
    }

    video.muted = mutedPreferenceRef.current;
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
        .fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.34 }, 0)
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
    mutedPreferenceRef.current = nextMuted;
    video.muted = nextMuted;
    dispatch({ type: 'set-muted', muted: nextMuted });
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

    const request = ++fullscreenRequestRef.current;
    const reportUnavailable = () => {
      if (fullscreenRequestRef.current === request && isCurrentVideo(video, project.slug)) {
        setFullscreenUnavailable(true);
      }
    };
    setFullscreenUnavailable(false);

    const fullscreenTarget = dialogRef.current?.requestFullscreen ? dialogRef.current : video;
    if (fullscreenTarget.requestFullscreen) {
      void fullscreenTarget.requestFullscreen().catch(reportUnavailable);
      return;
    }

    try {
      if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else reportUnavailable();
    } catch {
      reportUnavailable();
    }
  };

  const retryPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setPlaybackIssue(null);
    setLoading(true);
    setCurrentTime(0);
    video.load();
    attemptPlayback(video, project.slug, ++playbackGenerationRef.current);
  };

  const [width, height] = project.aspectRatio.split('/').map(Number);
  const aspect = width > 0 && height > 0 ? width / height : 16 / 9;

  return createPortal(
    <div
      aria-label={`播放作品：${project.title}`}
      aria-modal="true"
      className="player-overlay"
      data-lenis-prevent
      ref={dialogRef}
      role="dialog"
      style={{ '--player-aspect': aspect } as CSSProperties}
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
              key={`${project.slug}:${mediaUrl}`}
              ref={videoRef}
              playsInline
              poster={posterUrl ?? undefined}
              preload="metadata"
              src={mediaUrl}
              onCanPlay={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) setLoading(false);
              }}
              onError={(event) => {
                if (!isCurrentVideo(event.currentTarget, project.slug)) return;
                playbackGenerationRef.current += 1;
                dispatch({ type: 'paused' });
                setLoading(false);
                if (fallbackUrl && fallbackUrl !== mediaUrl && !usingFallback) {
                  setFallbackSlug(project.slug);
                } else {
                  setPlaybackIssue('error');
                }
              }}
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
              onPlaying={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  setLoading(false);
                  setPlaybackIssue(null);
                }
              }}
              onWaiting={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) setLoading(true);
              }}
              onTimeUpdate={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  setCurrentTime(event.currentTarget.currentTime);
                }
              }}
              onVolumeChange={(event) => {
                if (isCurrentVideo(event.currentTarget, project.slug)) {
                  mutedPreferenceRef.current = event.currentTarget.muted;
                  dispatch({ type: 'set-muted', muted: event.currentTarget.muted });
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
          {mediaUrl && playbackIssue === 'error' ? (
            <div className="player-overlay__feedback" role="alert">
              <p>视频暂时无法播放，请检查网络后重试。</p>
              <button type="button" onClick={retryPlayback}>重试播放</button>
            </div>
          ) : null}
          {mediaUrl && (playbackIssue === 'blocked' || (loading && !playbackIssue)) ? (
            <p className="player-overlay__feedback" role="status">
              {playbackIssue === 'blocked' ? '点击下方“播放”，开始观看完整作品。' : '正在加载视频…'}
            </p>
          ) : null}
        </div>

        <div className="player-overlay__meta">
          <div>
            <p>{String(project.order).padStart(2, '0')} / {getCategoryLabel(project.category)}</p>
            <h2>{project.title}</h2>
          </div>
          <div>
            {project.client ? <p>{project.client}</p> : null}
            <p>{project.roles.join(' · ')}</p>
            {project.year ? <p>{project.year}</p> : null}
            {usingFallback ? <p>已切换兼容播放 · H.264 / Rec.709</p> : null}
            {fullscreenUnavailable ? <p role="status">当前环境无法进入全屏，可继续在窗口内观看。</p> : null}
          </div>
        </div>

        {mediaUrl ? (
          <div className="player-overlay__controls" aria-label="视频控制">
            <button className="player-overlay__play-control" type="button" disabled={playbackIssue === 'error'} onClick={togglePlayback}>{isPlaying ? '暂停' : '播放'}</button>
            <span className="player-overlay__time player-overlay__time--elapsed">{formatTime(currentTime)}</span>
            <input
              aria-label="播放进度"
              disabled={!duration || playbackIssue === 'error'}
              max={duration || 1}
              min="0"
              step="0.1"
              type="range"
              value={Math.min(currentTime, duration || 1)}
              onChange={(event) => seek(Number(event.currentTarget.value))}
            />
            <span className="player-overlay__time player-overlay__time--duration">{formatTime(duration)}</span>
            <button className="player-overlay__mute-control" type="button" onClick={toggleMuted}>{isMuted ? '取消静音' : '静音'}</button>
            <button className="player-overlay__fullscreen-control" type="button" onClick={enterFullscreen}>全屏</button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

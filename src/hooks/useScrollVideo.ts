import { useEffect, useRef, useState } from 'react';
import type { RefObject, VideoHTMLAttributes } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from './useMediaQuery';

const DESKTOP_MEDIA_QUERY = '(min-width: 1024px) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const DEFAULT_SCROLL_DISTANCE = 1600;

gsap.registerPlugin(ScrollTrigger);

interface UseScrollVideoOptions {
  onProgress?: (progress: number | null) => void;
  poster: string;
  source: string | null;
  triggerRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  pinRef?: RefObject<HTMLElement | null>;
  scrollDistance?: number;
}

interface UseScrollVideoResult {
  motionEligible: boolean;
  motionEnabled: boolean;
  videoProps: Pick<
    VideoHTMLAttributes<HTMLVideoElement>,
    | 'autoPlay'
    | 'muted'
    | 'onError'
    | 'onLoadedMetadata'
    | 'playsInline'
    | 'poster'
    | 'preload'
    | 'src'
  >;
}

export function mapScrollProgressToTime(progress: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.min(Math.max(progress, 0), 1) * duration;
}

export function useScrollVideo({
  enabled = true,
  onProgress,
  pinRef,
  poster,
  scrollDistance = DEFAULT_SCROLL_DISTANCE,
  source,
  triggerRef,
  videoRef,
}: UseScrollVideoOptions): UseScrollVideoResult {
  const desktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [attachedSource, setAttachedSource] = useState<string | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const [readySource, setReadySource] = useState<string | null>(null);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const canLoadVideo = enabled
    && desktop
    && !reducedMotion
    && Boolean(source)
    && failedSource !== source;
  const hasAttachedSource = canLoadVideo && attachedSource === source;

  useEffect(() => {
    setReadySource(null);

    if (!canLoadVideo || !source) {
      setAttachedSource(null);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => setAttachedSource(source));

    return () => window.cancelAnimationFrame(frame);
  }, [canLoadVideo, source]);

  useEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    const pin = pinRef?.current ?? trigger;
    const duration = video?.duration ?? 0;

    if (
      !hasAttachedSource
      || readySource !== source
      || !video
      || !trigger
      || !pin
      || !Number.isFinite(duration)
      || duration <= 0
    ) {
      return undefined;
    }

    const resolvedScrollDistance = Number.isFinite(scrollDistance) && scrollDistance > 0
      ? scrollDistance
      : DEFAULT_SCROLL_DISTANCE;
    let anchorFrame: number | null = null;
    let initialProgress = 0;
    let seekFrame: number | null = null;
    let targetProgress = 0;
    let targetTime = 0;
    const captureAlignedHashTarget = () => {
      const hash = window.location.hash;
      const target = document.getElementById(hash.slice(1));
      if (!target) {
        return null;
      }

      const targetTop = target.getBoundingClientRect().top;
      const scrollMargin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      if (Math.abs(targetTop - scrollMargin) > 1) {
        return null;
      }

      return { hash, scrollY: window.scrollY, target };
    };
    let pendingHashTarget = captureAlignedHashTarget();
    const queueHashTargetRestore = () => {
      const snapshot = pendingHashTarget;
      pendingHashTarget = null;
      if (!snapshot) {
        return;
      }

      if (anchorFrame !== null) {
        window.cancelAnimationFrame(anchorFrame);
      }

      anchorFrame = window.requestAnimationFrame(() => {
        anchorFrame = null;
        if (
          window.location.hash !== snapshot.hash
          || window.scrollY !== snapshot.scrollY
          || !snapshot.target.isConnected
        ) {
          return;
        }

        snapshot.target.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    };
    const context = gsap.context(() => {
      const scrollTrigger = ScrollTrigger.create({
        trigger,
        pin,
        start: 'top top',
        end: () => `+=${resolvedScrollDistance}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          pendingHashTarget = captureAlignedHashTarget();
        },
        onRefresh: queueHashTargetRestore,
        onUpdate: ({ progress }) => {
          targetProgress = progress;
          targetTime = mapScrollProgressToTime(progress, duration);

          if (seekFrame !== null) {
            return;
          }

          seekFrame = window.requestAnimationFrame(() => {
            seekFrame = null;

            if (videoRef.current === video && Math.abs(video.currentTime - targetTime) > 0.001) {
              video.currentTime = targetTime;
            }

            onProgressRef.current?.(targetProgress);
          });
        },
      });
      initialProgress = scrollTrigger.progress;
    }, trigger);
    queueHashTargetRestore();
    onProgressRef.current?.(initialProgress);

    return () => {
      if (anchorFrame !== null) {
        window.cancelAnimationFrame(anchorFrame);
      }

      if (seekFrame !== null) {
        window.cancelAnimationFrame(seekFrame);
      }

      context.revert();
      onProgressRef.current?.(null);
    };
  }, [hasAttachedSource, pinRef, readySource, scrollDistance, source, triggerRef, videoRef]);

  return {
    motionEligible: canLoadVideo,
    motionEnabled: hasAttachedSource && readySource === source,
    videoProps: {
      autoPlay: false,
      muted: true,
      onError: () => {
        setFailedSource(source);
        setAttachedSource(null);
        setReadySource(null);
      },
      onLoadedMetadata: (event) => {
        const duration = event.currentTarget.duration;
        if (hasAttachedSource && source && Number.isFinite(duration) && duration > 0) {
          setReadySource(source);
        } else if (hasAttachedSource && source) {
          setFailedSource(source);
        }
      },
      playsInline: true,
      poster,
      preload: hasAttachedSource ? 'auto' : 'none',
      src: hasAttachedSource && source ? source : undefined,
    },
  };
}

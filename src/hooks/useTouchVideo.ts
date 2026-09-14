import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/** Inline mobile motion; a tap retries playback inside the browser's user gesture. */
export function useTouchVideo(ref: RefObject<HTMLVideoElement | null>, enabled: boolean, paused: boolean) {
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);
  const allowed = useRef(false);
  const generation = useRef(0);
  const play = useCallback(() => {
    const video = ref.current;
    if (!video || !allowed.current) return;
    const request = ++generation.current;
    video.muted = true;
    try {
      void video.play()?.then(() => {
        if (request === generation.current) setPlaying(true);
        else if (!allowed.current || userPaused.current) video.pause();
      }, () => { if (request === generation.current) setPlaying(false); });
    } catch { setPlaying(false); }
  }, [ref]);

  useEffect(() => {
    const video = ref.current;
    if (!enabled || !video) return;
    let visible = typeof IntersectionObserver === 'undefined';
    const update = () => {
      allowed.current = visible && !paused && document.visibilityState === 'visible';
      if (allowed.current && !userPaused.current) play();
      else { ++generation.current; video.pause(); setPlaying(false); }
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    }, { threshold: 0.01 });
    observer?.observe(video);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', update);
      allowed.current = false;
      ++generation.current;
      video.pause();
    };
  }, [enabled, paused, play, ref]);

  const toggle = () => {
    if (!enabled || paused || !allowed.current) return;
    userPaused.current = playing;
    if (playing) { ++generation.current; ref.current?.pause(); setPlaying(false); }
    else play();
  };
  return { playing, toggle };
}

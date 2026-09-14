import { fireEvent, render, screen, act, cleanup } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { useTouchVideo } from './useTouchVideo';

function Harness({ enabled = true, paused = false }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { playing, toggle } = useTouchVideo(ref, enabled, paused);
  return <><video ref={ref} /><button onClick={toggle}>{playing ? '暂停' : '播放'}</button></>;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it('retries blocked autoplay directly from a user tap and pauses when an overlay opens', async () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValueOnce(new Error('blocked')).mockResolvedValue();
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const { rerender } = render(<Harness />);
  await act(async () => {});
  fireEvent.click(screen.getByRole('button', { name: '播放' }));
  expect(play).toHaveBeenCalledTimes(2);
  await act(async () => {});
  expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument();
  rerender(<Harness paused />);
  expect(pause).toHaveBeenCalled();
  await act(async () => {});
  expect(screen.getByRole('button', { name: '播放' })).toBeInTheDocument();
});
it('does not start when disabled or after leaving the viewport', async () => {
  let observe: IntersectionObserverCallback = () => {};
  vi.stubGlobal('IntersectionObserver', class { constructor(cb: IntersectionObserverCallback) { observe = cb; } observe() {} disconnect() {} });
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  const { rerender } = render(<Harness enabled={false} />);
  expect(play).not.toHaveBeenCalled();
  rerender(<Harness />);
  await act(async () => observe([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(play).toHaveBeenCalledOnce();
  act(() => observe([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(pause).toHaveBeenCalled();
});

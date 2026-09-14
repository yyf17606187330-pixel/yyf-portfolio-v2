import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeroComposite, getHeroComposition } from './HeroComposite';
import foreground from './heroForeground.json';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Hero frame compositing', () => {
  it('keeps every head contour inside the full canvas at desktop and phone sizes', () => {
    for (const [width, height] of [[1440, 760], [1920, 900], [1024, 720], [390, 430], [375, 400]]) {
      const { dx, dy, dw, dh } = getHeroComposition(width, height, 1920, 1080);
      const points = foreground.frames.flat();
      expect(Math.min(...points.map(([x]) => dx + x / foreground.width * dw))).toBeGreaterThan(12);
      expect(Math.max(...points.map(([x]) => dx + x / foreground.width * dw))).toBeLessThan(width - 12);
      expect(Math.min(...points.map(([, y]) => dy + y / foreground.height * dh))).toBeGreaterThan(12);
      expect(Math.max(...points.map(([, y]) => dy + y / foreground.height * dh))).toBeLessThan(height - 12);
    }
  });
  it('keeps the generated contours tied to the exact source video and all 96 frames', () => {
    const source = readFileSync('public/media/p5/hero/hero-scroll.mp4');
    expect(createHash('sha256').update(source).digest('hex')).toBe(foreground.sourceSha256);
    expect(foreground.frames).toHaveLength(96);
    expect(foreground.fps).toBe(24);
    expect(foreground.frames.every(frame => frame.length > 20)).toBe(true);
  });

  it('draws both image layers from one decoded video and cleans up seeking callbacks', async () => {
    class MockPath { moveTo = vi.fn(); lineTo = vi.fn(); closePath = vi.fn(); }
    vi.stubGlobal('Path2D', MockPath);
    const context = { setTransform: vi.fn(), clearRect: vi.fn(), fill: vi.fn(), fillRect: vi.fn(), stroke: vi.fn(),
      beginPath: vi.fn(), rect: vi.fn(), translate: vi.fn(),
      save: vi.fn(), restore: vi.fn(), clip: vi.fn(), drawImage: vi.fn(), fillStyle: '' };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'clientWidth', 'get').mockReturnValue(640);
    vi.spyOn(HTMLCanvasElement.prototype, 'clientHeight', 'get').mockReturnValue(800);
    const video = document.createElement('video');
    Object.defineProperties(video, { readyState: { value: 2 }, videoWidth: { value: 1920 }, videoHeight: { value: 1080 } });
    let tick: VideoFrameRequestCallback;
    video.requestVideoFrameCallback = vi.fn(callback => { tick = callback; return 7; });
    video.cancelVideoFrameCallback = vi.fn();
    const ready = vi.fn();
    const { unmount } = render(<HeroComposite videoRef={{ current: video }} source="test.mp4" onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenCalled());
    const firstMask = context.clip.mock.calls.at(-1)![0] as MockPath;
    const firstHeadPoint = firstMask.moveTo.mock.calls[0];
    // The decoded callback must win over a newer requested seek time.
    video.currentTime = 3.9;
    const beforeDuplicate = context.drawImage.mock.calls.length;
    tick!(0, { mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(context.drawImage).toHaveBeenCalledTimes(beforeDuplicate);
    expect(context.translate).toHaveBeenCalledWith(8, 6.4);
    const callbackMask = context.clip.mock.calls.at(-1)![0] as MockPath;
    expect(callbackMask.moveTo.mock.calls[0]).toEqual(firstHeadPoint);
    const layers = context.drawImage.mock.calls.slice(-2);
    expect(layers[0]).toEqual(layers[1]);
    expect(layers[0][0]).toBe(video);
    expect(ready).toHaveBeenCalledWith('test.mp4');
    video.currentTime = 4;
    fireEvent.seeked(video);
    const lastMask = context.clip.mock.calls.at(-1)![0] as MockPath;
    expect(lastMask.moveTo.mock.calls[0]).not.toEqual(firstHeadPoint);
    unmount();
    const count = context.drawImage.mock.calls.length;
    fireEvent.seeked(video);
    expect(context.drawImage).toHaveBeenCalledTimes(count);
    expect(video.cancelVideoFrameCallback).toHaveBeenCalledWith(7);
  });
});

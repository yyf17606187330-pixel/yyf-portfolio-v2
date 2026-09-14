import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageGallery } from './ImageGallery';

const images = [
  { id: 'one', title: '第一张', src: 'one.webp', width: 1254, height: 1254 },
  { id: 'two', title: '第二张', src: 'two.webp', width: 1254, height: 1254 },
  { id: 'wide', title: '宽幅图片', src: 'wide.webp', width: 2172, height: 724 },
];
const renderGallery = (initialIndex = 0, onClose = vi.fn(), opener: HTMLElement | null = null) =>
  render(<ImageGallery images={images} title="测试相册" initialIndex={initialIndex} onClose={onClose} opener={opener} />);

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('ImageGallery', () => {
  it('opens the selected image and supports bounded button, slider and keyboard navigation', () => {
    renderGallery(1);
    expect(screen.getByRole('slider', { name: '选择照片' })).toHaveValue('2');
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('status')).toHaveTextContent('宽幅图片');
    expect(screen.getByRole('button', { name: '下一张' })).toBeDisabled();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(screen.getByRole('slider')).toHaveValue('2');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'End' });
    expect(screen.getByRole('slider')).toHaveValue('3');
  });

  it('consumes gallery wheel gestures once per cooldown while preserving browser zoom', () => {
    renderGallery();
    const track = screen.getByLabelText('横向照片轮播');
    expect(fireEvent.wheel(track, { deltaY: 80, cancelable: true })).toBe(false);
    expect(screen.getByRole('slider')).toHaveValue('2');
    fireEvent.wheel(track, { deltaY: 80 });
    expect(screen.getByRole('slider')).toHaveValue('2');
    act(() => vi.advanceTimersByTime(500));
    expect(fireEvent.wheel(track, { deltaY: 80, ctrlKey: true, cancelable: true })).toBe(true);
    expect(screen.getByRole('slider')).toHaveValue('2');
    fireEvent.wheel(track, { deltaY: -4, deltaMode: 1 });
    expect(screen.getByRole('slider')).toHaveValue('1');
  });

  it('updates the caption after native touch or trackpad scrolling settles', () => {
    renderGallery();
    const track = screen.getByLabelText('横向照片轮播');
    Object.defineProperty(track, 'clientWidth', { configurable: true, value: 500 });
    Object.defineProperty(track, 'scrollTo', { configurable: true, value: vi.fn() });
    Array.from(track.children).forEach((child, index) => {
      Object.defineProperty(child, 'offsetLeft', { configurable: true, value: 75 + index * 350 });
      Object.defineProperty(child, 'offsetWidth', { configurable: true, value: 350 });
    });
    track.scrollLeft = 700;
    fireEvent.scroll(track);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole('slider')).toHaveValue('3');
    expect(screen.getByRole('status')).toHaveTextContent('宽幅图片');
  });

  it.each([
    { position: 0, title: '第一张', imageWidth: 400, imageHeight: 400 },
    { position: 2, title: '宽幅图片', imageWidth: 400, imageHeight: 400 / 3 },
  ])('enlarges $title inside the viewport without replacing the image and reverses on Escape', ({ position, title, imageWidth, imageHeight }) => {
    const close = vi.fn();
    renderGallery(position, close);
    const track = screen.getByLabelText('横向照片轮播');
    const selected = screen.getByRole('button', { name: `放大：${title}` });
    const originalImage = selected.querySelector('img');
    Object.defineProperties(track, {
      clientWidth: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 600 },
      scrollTo: { configurable: true, value: vi.fn() },
    });
    Object.defineProperties(selected, {
      offsetWidth: { configurable: true, value: 400 },
      offsetHeight: { configurable: true, value: 400 },
      offsetLeft: { configurable: true, value: 300 },
    });
    fireEvent.click(selected);
    expect(selected).toHaveFocus();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'true');
    expect(selected.querySelector('img')).toBe(originalImage);
    const scale = Number(selected.style.getPropertyValue('--gallery-zoom-scale'));
    expect(scale).toBeGreaterThan(1);
    expect(imageWidth * scale).toBeLessThanOrEqual(1000 * 0.94);
    expect(imageHeight * scale).toBeLessThanOrEqual(600 * 0.94);
    expect(screen.getByRole('slider')).toBeEnabled();
    fireEvent.wheel(track, { deltaY: 80 });
    expect(screen.getByRole('slider')).toHaveValue(String(position + 1));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'false');
    expect(screen.getByRole('button', { name: `放大：${title}` })).toHaveFocus();
    expect(selected.querySelector('img')).toBe(originalImage);
    expect(screen.getByRole('slider')).not.toBeDisabled();
    fireEvent.click(selected);
    fireEvent.click(screen.getByRole('button', { name: `缩小：${title}` }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'false');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });

  it('changes photos in full-frame mode with buttons, slider and a touch swipe without turning a swipe into a click', () => {
    renderGallery();
    fireEvent.click(screen.getByRole('button', { name: '放大：第一张' }));
    fireEvent.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('button', { name: '缩小：第二张' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    const track = screen.getByLabelText('横向照片轮播');
    fireEvent.touchStart(track, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(track, { changedTouches: [{ clientX: 120, clientY: 105 }] });
    expect(screen.getByRole('slider')).toHaveValue('2');
    fireEvent.click(screen.getByRole('button', { name: '缩小：第二张' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-zoomed', 'true');
    act(() => vi.advanceTimersByTime(500));
    fireEvent.touchStart(track, { touches: [{ clientX: 300, clientY: 100 }, { clientX: 350, clientY: 100 }] });
    fireEvent.touchEnd(track, { changedTouches: [{ clientX: 100, clientY: 100 }] });
    expect(screen.getByRole('slider')).toHaveValue('2');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '缩小：宽幅图片' })).toBeInTheDocument();
  });

  it('restores the opener, body styles and reading position on unmount', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const scroll = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(620);
    const { unmount } = renderGallery(0, vi.fn(), opener);
    expect(document.body.style.top).toBe('-620px');
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 620, left: 0, behavior: 'auto' });
    expect(opener).toHaveFocus();
    opener.remove();
    scroll.mockRestore();
  });
});

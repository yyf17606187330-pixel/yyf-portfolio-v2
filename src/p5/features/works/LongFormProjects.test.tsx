import { act, cleanup, createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LongFormProjects } from './LongFormProjects';
import { colorGradingWorkGroup } from '../../content/colorGradingWorks';

describe('Direct film selection', () => {
  const observed = new Map<Element, IntersectionObserverCallback>();
  const enter = () => act(() => {
    for (const [target, callback] of observed) callback([{ isIntersecting: true, target } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
  beforeEach(() => {
    observed.clear();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => ({
      observe: (target: Element) => observed.set(target, callback), disconnect: vi.fn(),
    })));
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('shows every title immediately and allows jumping directly to any film without changing the other group', () => {
    render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const menu = screen.getByRole('list', { name: '精选影像 / 01目录' });
    expect(within(menu).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
      '选择旅拍 Vlog', '选择剧情短片', '选择MacBook 短片', '选择棋局短片',
    ]);
    fireEvent.click(screen.getByRole('button', { name: '选择棋局短片' }));
    expect(screen.getByRole('heading', { name: '棋局短片' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '滑板工坊' })).toBeVisible();
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2);
  });

  it('retains the verified roles, aspect ratios, duration and independent-work scope', () => {
    const onOpenProject = vi.fn();
    render(<LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />);
    expect(screen.getByText(/从 800\+ 段素材/)).toBeInTheDocument();
    const travel = screen.getByRole('button', { name: '播放旅拍 Vlog完整作品' });
    fireEvent.click(travel);
    expect(onOpenProject).toHaveBeenLastCalledWith(expect.objectContaining({
      slug: 'travel-vlog', aspectRatio: '2/1', roles: ['剪辑', '调色', '配乐', '人声'],
      fullSrc: 'projects/long-form/travel/full-hevc.mp4',
    }), travel);
    fireEvent.click(screen.getByRole('button', { name: '选择剧情短片' }));
    const narrative = screen.getByRole('button', { name: '播放剧情短片完整作品' });
    fireEvent.click(narrative);
    expect(onOpenProject).toHaveBeenLastCalledWith(expect.objectContaining({
      roles: ['编导', '制片', '拍摄', '剪辑', '调色', '输出'],
    }), narrative);
    fireEvent.click(screen.getByRole('button', { name: '选择MacBook 短片' }));
    expect(screen.getByText('以 MacBook 为主体的 22 秒自主产品短片。')).toBeInTheDocument();
  });

  it('keeps every color grade selectable and never opens its preview as a full film', () => {
    const onOpenProject = vi.fn();
    render(<LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />);
    for (const item of colorGradingWorkGroup.items) {
      fireEvent.click(screen.getByRole('button', { name: '选择' + item.title }));
      expect(screen.getByRole('heading', { name: item.title })).toBeVisible();
      const unavailable = screen.getByRole('button', { name: item.title + '完整视频暂不可用' });
      expect(unavailable).toBeDisabled();
      fireEvent.click(unavailable);
    }
    expect(onOpenProject).not.toHaveBeenCalled();
  });

  it('supports arrow keys, wrapping, Home and End while retaining focus on the selection', () => {
    render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const buttons = within(screen.getByRole('list', { name: '精选影像 / 01目录' })).getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowUp' });
    expect(buttons[3]).toHaveFocus();
    expect(buttons[3]).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(buttons[3], { key: 'Home' });
    expect(buttons[0]).toHaveFocus();
    fireEvent.keyDown(buttons[0], { key: 'End' });
    expect(buttons[3]).toHaveFocus();
    fireEvent.keyDown(buttons[3], { key: 'ArrowRight' });
    expect(buttons[0]).toHaveFocus();
  });

  it('leaves vertical scrolling and PageDown to the page', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    const frame = container.querySelector('.film-console__screen')!;
    const wheel = createEvent.wheel(frame, { deltaY: 120, cancelable: true });
    fireEvent(frame, wheel);
    expect(wheel.defaultPrevented).toBe(false);
    const page = createEvent.keyDown(screen.getByRole('button', { name: '选择旅拍 Vlog' }), { key: 'PageDown', cancelable: true });
    fireEvent(screen.getByRole('button', { name: '选择旅拍 Vlog' }), page);
    expect(page.defaultPrevented).toBe(false);
    expect(screen.getByRole('heading', { name: '旅拍 Vlog' })).toBeVisible();
  });

  it('loads only the two selected previews and no full film before a deliberate play click', () => {
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={vi.fn()} />);
    expect(container.querySelectorAll('video')).toHaveLength(0);
    enter();
    expect(container.querySelectorAll('video')).toHaveLength(2);
    expect(container.querySelector('video[src*="full-"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '选择剧情短片' }));
    enter();
    expect(container.querySelectorAll('video')).toHaveLength(2);
    expect(container.querySelector('video[src*="/travel/"]')).toBeNull();
    expect(container.querySelector('video[src*="/narrative/"]')).not.toBeNull();
  });

  it('honors preview pause and suspends playback while the global player is open', () => {
    const props = { playerOpen: false, onOpenProject: vi.fn() };
    const { container, rerender } = render(<LongFormProjects {...props} />);
    enter();
    fireEvent.click(screen.getAllByRole('button', { name: '暂停预览' })[0]);
    expect(container.querySelectorAll('video')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '继续预览' }));
    expect(container.querySelectorAll('video')).toHaveLength(2);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    pause.mockClear();
    rerender(<LongFormProjects {...props} playerOpen />);
    expect(pause).toHaveBeenCalled();
    expect(container.querySelector('video[src*="full-"]')).toBeNull();
  });

  it('retains selection and full-play access in reduced motion without loading previews', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    const onOpenProject = vi.fn();
    const { container } = render(<LongFormProjects playerOpen={false} onOpenProject={onOpenProject} />);
    fireEvent.click(screen.getByRole('button', { name: '选择棋局短片' }));
    expect(container.querySelector('video')).toBeNull();
    expect(screen.queryByRole('button', { name: '暂停预览' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '播放棋局短片完整作品' }));
    expect(onOpenProject).toHaveBeenCalledOnce();
  });
});
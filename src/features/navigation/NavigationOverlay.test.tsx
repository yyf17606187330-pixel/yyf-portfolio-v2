import { useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationOverlay } from './NavigationOverlay';

const gsapMock = vi.hoisted(() => {
  const timeline = vi.fn(() => {
    const api = { fromTo: vi.fn() };
    api.fromTo.mockReturnValue(api);
    return api;
  });
  const context = vi.fn((callback: () => void) => {
    callback();
    return { revert: vi.fn() };
  });

  return { context, timeline };
});

vi.mock('gsap', () => ({
  default: {
    context: gsapMock.context,
    timeline: gsapMock.timeline,
  },
}));

function setReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function NavigationHarness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>
        打开菜单
      </button>
      <a href="#outside">外部链接</a>
      <NavigationOverlay
        open={open}
        opener={openerRef.current}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}

describe('NavigationOverlay', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    gsapMock.context.mockClear();
    gsapMock.timeline.mockClear();
  });

  it('renders as a modal portal and traps keyboard focus inside the menu', async () => {
    render(<NavigationHarness onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '打开菜单' }));

    const dialog = await screen.findByRole('dialog', { name: '全站导航' });
    const closeButton = screen.getByRole('button', { name: '关闭菜单' });
    const contactLink = screen.getByRole('link', { name: 'CONTACT' });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(closeButton).toHaveFocus());

    contactLink.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(contactLink).toHaveFocus();
  });

  it('closes on Escape and restores focus to the menu opener', async () => {
    const onClose = vi.fn();
    render(<NavigationHarness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: '打开菜单' });
    fireEvent.click(opener);

    await screen.findByRole('dialog', { name: '全站导航' });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '全站导航' })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('skips its GSAP timeline for reduced motion while keeping the dialog operable', async () => {
    setReducedMotion(true);
    const onClose = vi.fn();

    render(<NavigationOverlay open opener={null} onClose={onClose} />);

    expect(gsapMock.context).not.toHaveBeenCalled();
    expect(gsapMock.timeline).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: '全站导航' })).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: '关闭菜单' });
    await waitFor(() => expect(closeButton).toHaveFocus());
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders the four approved capability groups and their exact skill sets', () => {
    render(<NavigationOverlay open opener={null} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Film & Direction' })).toBeInTheDocument();
    expect(screen.getByText('编导 · 拍摄 · 剪辑 · 调色 · 基础特效')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Photography & Retouch' })).toBeInTheDocument();
    expect(screen.getByText('人像/商品棚拍 · 人像修图')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Visual Design' })).toBeInTheDocument();
    expect(screen.getByText('PS 合成 · 平面修改与设计')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI & Creative Tech' })).toBeInTheDocument();
    expect(screen.getByText('AI 视频 · 工作流 · AI 前端')).toBeInTheDocument();
  });

  it('positions a requested section without moving initial focus away from close', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function getOffsetTop(this: HTMLElement) {
      return this.id === 'about' ? 640 : 0;
    });

    render(<NavigationOverlay open opener={null} onClose={vi.fn()} target="about" />);

    const dialog = screen.getByRole('dialog', { name: '全站导航' });
    const closeButton = screen.getByRole('button', { name: '关闭菜单' });
    expect(dialog.scrollTop).toBe(640);
    expect(dialog).toHaveAttribute('aria-describedby', 'about-title');
    expect(screen.getByRole('link', { name: 'ABOUT' })).toHaveAttribute('aria-current', 'location');
    await waitFor(() => expect(closeButton).toHaveFocus());
  });
});

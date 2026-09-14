import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { StrictMode, useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import gsap from 'gsap';
import { useTextReveal } from './useTextReveal';

interface HarnessProps {
  enabled?: boolean;
  paused?: boolean;
}

function Harness({ enabled = true, paused = false }: HarnessProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useTextReveal(rootRef, { enabled, paused });

  return (
    <div id="top" ref={rootRef}>
      <section data-text-reveal-group="intro">
        <h2 data-text-reveal>章节标题</h2>
        <p data-text-reveal>章节正文</p>
      </section>
      <a href="#details"><span data-text-reveal>查看详情</span></a>
      <section data-text-reveal-group="details" id="details">
        <h3 data-text-reveal>详情标题</h3>
      </section>
    </div>
  );
}

function DynamicHarness() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  useTextReveal(rootRef, { enabled: true, paused: false });

  return (
    <div ref={rootRef}>
      <button onClick={() => setExpanded(true)} type="button">展开内容</button>
      {expanded ? (
        <section data-text-reveal-group="dynamic">
          <h3 data-text-reveal>动态标题</h3>
          <p data-text-reveal>动态正文</p>
        </section>
      ) : null}
    </div>
  );
}

function HiddenHarness() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);
  useTextReveal(rootRef, { enabled: true, paused: false });

  return (
    <div ref={rootRef}>
      <button onClick={() => setHidden(false)} type="button">显示说明</button>
      <section data-text-reveal-group="hidden-detail" hidden={hidden}>
        <p data-text-reveal>常驻技能说明</p>
      </section>
    </div>
  );
}

function DetailsHarness() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useTextReveal(rootRef, { enabled: true, paused: false });

  return (
    <div ref={rootRef}>
      <button onClick={() => setOpen(true)} type="button">打开图片说明</button>
      <details open={open}>
        <summary>图片信息</summary>
        <div data-text-reveal-group="image-detail">
          <p data-text-reveal>图片补充说明</p>
        </div>
      </details>
    </div>
  );
}

function LateMarkerHarness() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [marked, setMarked] = useState(false);
  useTextReveal(rootRef, { enabled: true, paused: false });

  return (
    <div ref={rootRef}>
      <button onClick={() => setMarked((current) => !current)} type="button">
        {marked ? '移除文字标记' : '标记新增文字'}
      </button>
      <p data-text-reveal={marked ? '' : undefined}>后标记正文</p>
    </div>
  );
}

function RefreshingHarness() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [updated, setUpdated] = useState(false);
  useTextReveal(rootRef, { enabled: true, paused: false });

  return (
    <div ref={rootRef}>
      <button onClick={() => setUpdated(true)} type="button">更新计数</button>
      <section data-text-reveal-group="refreshing">
        <h2 data-text-reveal>刷新测试标题</h2>
        <p data-text-reveal>刷新测试正文</p>
      </section>
      {updated ? <span>计数 2</span> : null}
    </div>
  );
}

describe('useTextReveal', () => {
  const observers: Array<{
    callback: IntersectionObserverCallback;
    disconnect: ReturnType<typeof vi.fn>;
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  }> = [];

  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      const observer = {
        callback,
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: vi.fn(() => []),
        unobserve: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
      };
      observers.push(observer);
      return observer;
    }));
  });

  afterEach(() => {
    gsap.globalTimeline.clear();
    window.history.replaceState(null, '', window.location.pathname);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const enter = (target: Element, top = 700, isIntersecting = true) => {
    const observer = [...observers].reverse().find((candidate) => (
      candidate.observe.mock.calls.some(([observed]) => observed === target)
    )) ?? observers.at(-1)!;
    act(() => observer.callback([{
      isIntersecting,
      target,
      boundingClientRect: { top } as DOMRectReadOnly,
    } as IntersectionObserverEntry], observer as unknown as IntersectionObserver));
  };

  it('keeps disabled copy readable, then reveals each group once when it enters the viewport', () => {
    const { container, rerender } = render(<Harness enabled={false} />);
    const heading = container.querySelector<HTMLElement>('h2')!;
    const copy = container.querySelector<HTMLElement>('p')!;
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group]')!;

    expect(heading).not.toHaveAttribute('data-text-reveal-state');
    expect(heading.style.opacity).toBe('');

    rerender(<Harness />);

    expect(heading).toHaveAttribute('data-text-reveal-state', 'pending');
    expect(copy).toHaveAttribute('data-text-reveal-state', 'pending');
    expect(Number(heading.style.opacity)).toBe(0);

    enter(group);

    const animation = gsap.getTweensOf(heading)[0];
    expect(animation).toBeDefined();
    act(() => { animation.totalProgress(1); });

    expect(heading).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(copy).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(heading.style.opacity).toBe('');

    enter(group, 900, false);
    enter(group);

    expect(heading).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(gsap.getTweensOf(heading)).toHaveLength(0);
  });

  it('queues an intersecting group while paused and pauses an active reveal without resetting it', () => {
    const { container, rerender } = render(<Harness paused />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"]')!;
    const heading = group.querySelector<HTMLElement>('h2')!;

    enter(group);
    expect(heading).toHaveAttribute('data-text-reveal-state', 'pending');
    expect(gsap.getTweensOf(heading)).toHaveLength(0);

    rerender(<Harness />);
    expect(heading).toHaveAttribute('data-text-reveal-state', 'animating');
    const animation = gsap.getTweensOf(heading)[0];
    expect(animation.paused()).toBe(false);

    rerender(<Harness paused />);
    expect(animation.paused()).toBe(true);
    rerender(<Harness />);
    expect(animation.paused()).toBe(false);
  });

  it('pauses active reveals while the document is hidden and resumes them when focus returns', () => {
    let visibility: DocumentVisibilityState = 'visible';
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
    const { container } = render(<Harness />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"]')!;
    const heading = group.querySelector<HTMLElement>('h2')!;

    enter(group);
    const animation = gsap.getTweensOf(heading)[0];
    expect(animation.paused()).toBe(false);

    visibility = 'hidden';
    fireEvent(document, new Event('visibilitychange'));
    expect(animation.paused()).toBe(true);

    visibility = 'visible';
    fireEvent(document, new Event('visibilitychange'));
    expect(animation.paused()).toBe(false);
  });

  it('pauses active reveals when the browser window blurs even if the document stays visible', () => {
    const { container } = render(<Harness />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"]')!;
    const heading = group.querySelector<HTMLElement>('h2')!;
    enter(group);
    const animation = gsap.getTweensOf(heading)[0];

    fireEvent.blur(window);
    expect(animation.paused()).toBe(true);

    fireEvent.focus(window);
    expect(animation.paused()).toBe(false);
  });

  it('reveals keyboard-focused links immediately instead of leaving focus on invisible copy', () => {
    const { container } = render(<Harness />);
    const link = container.querySelector<HTMLAnchorElement>('a[href="#details"]')!;
    const label = link.querySelector<HTMLElement>('[data-text-reveal]')!;
    expect(Number(label.style.opacity)).toBe(0);

    act(() => { link.focus(); });

    expect(link).toHaveFocus();
    expect(label).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(label.style.opacity).toBe('');
  });

  it('staggers grouped copy in DOM reading order instead of revealing every line together', () => {
    const { container } = render(<Harness />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"]')!;
    const heading = group.querySelector<HTMLElement>('h2')!;
    const copy = group.querySelector<HTMLElement>('p')!;

    enter(group);
    const animation = gsap.getTweensOf(heading)[0];
    act(() => { animation.totalProgress(0.2); });

    expect(Number(heading.style.opacity)).toBeGreaterThan(Number(copy.style.opacity));
  });

  it('uses a lighter entrance budget for coarse-pointer devices', () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    const { container } = render(<Harness />);
    const heading = container.querySelector<HTMLElement>('h2')!;

    expect(heading.style.filter).toBe('blur(10px)');
    expect(heading.style.transform).toContain('14px');
  });

  it('keeps all copy static and readable for reduced motion or without IntersectionObserver', () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    const reduced = render(<Harness />);
    const reducedHeading = reduced.container.querySelector<HTMLElement>('h2')!;
    expect(reducedHeading.style.opacity).toBe('');
    expect(reducedHeading).not.toHaveAttribute('data-text-reveal-state');
    reduced.unmount();

    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));
    vi.stubGlobal('IntersectionObserver', undefined);
    const unsupported = render(<Harness />);
    const unsupportedHeading = unsupported.container.querySelector<HTMLElement>('h2')!;
    expect(unsupportedHeading.style.opacity).toBe('');
    expect(unsupportedHeading).not.toHaveAttribute('data-text-reveal-state');
  });

  it('registers newly expanded text without wrapping or duplicating its accessible content', async () => {
    const { container, getByRole, getByText } = render(<DynamicHarness />);
    fireEvent.click(getByRole('button', { name: '展开内容' }));
    const heading = getByText('动态标题');
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="dynamic"]')!;

    await waitFor(() => expect(heading).toHaveAttribute('data-text-reveal-state', 'pending'));
    expect(getByText('动态标题')).toBe(heading);
    expect(container.querySelectorAll('[data-text-reveal]')).toHaveLength(2);

    enter(group);
    const animation = gsap.getTweensOf(heading)[0];
    act(() => { animation.totalProgress(1); });
    expect(heading).toHaveAttribute('data-text-reveal-state', 'revealed');
  });

  it('animates content expanded after restoring a deep scroll position', async () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(640);
    const { container, getByRole, getByText } = render(<DynamicHarness />);

    fireEvent.click(getByRole('button', { name: '展开内容' }));
    const heading = getByText('动态标题');
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="dynamic"]')!;

    await waitFor(() => expect(heading).toHaveAttribute('data-text-reveal-state', 'pending'));
    enter(group);
    expect(heading).toHaveAttribute('data-text-reveal-state', 'animating');
    expect(gsap.getTweensOf(heading)).toHaveLength(1);
  });

  it('keeps an in-progress reveal intact when later DOM updates refresh the registry', async () => {
    let scrollY = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
    const { container, getByRole, getByText } = render(<RefreshingHarness />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="refreshing"]')!;
    const heading = getByText('刷新测试标题');

    enter(group);
    const animation = gsap.getTweensOf(heading)[0];
    act(() => { animation.totalProgress(0.25); });
    scrollY = 640;
    fireEvent.click(getByRole('button', { name: '更新计数' }));

    await waitFor(() => expect(getByText('计数 2')).toBeInTheDocument());
    await waitFor(() => expect(heading).toHaveAttribute('data-text-reveal-state', 'animating'));
    expect(gsap.getTweensOf(heading)).toContain(animation);
    expect(animation.totalProgress()).toBeGreaterThanOrEqual(0.25);
    expect(animation.totalProgress()).toBeLessThan(1);
  });

  it('registers text when the input marker attribute is added after insertion', async () => {
    const { getByRole, getByText } = render(<LateMarkerHarness />);
    const copy = getByText('后标记正文');
    expect(copy).not.toHaveAttribute('data-text-reveal-state');

    fireEvent.click(getByRole('button', { name: '标记新增文字' }));

    await waitFor(() => expect(copy).toHaveAttribute('data-text-reveal-state', 'pending'));
    enter(copy);
    const animation = gsap.getTweensOf(copy)[0];
    act(() => { animation.totalProgress(1); });
    expect(copy).toHaveAttribute('data-text-reveal-state', 'revealed');
  });

  it('restores pending copy when its input marker is removed', async () => {
    const { getByRole, getByText } = render(<LateMarkerHarness />);
    const copy = getByText('后标记正文');
    fireEvent.click(getByRole('button', { name: '标记新增文字' }));
    await waitFor(() => expect(copy).toHaveAttribute('data-text-reveal-state', 'pending'));

    fireEvent.click(getByRole('button', { name: '移除文字标记' }));

    await waitFor(() => expect(copy).not.toHaveAttribute('data-text-reveal-state'));
    expect(copy.style.opacity).toBe('');
    expect(copy.style.filter).toBe('');
    expect(copy.style.transform).toBe('');
  });

  it('does not consume hidden persistent copy and registers it after the hidden attribute clears', async () => {
    const { container, getByRole, getByText } = render(<HiddenHarness />);
    const copy = getByText('常驻技能说明');
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="hidden-detail"]')!;

    expect(copy).not.toHaveAttribute('data-text-reveal-state');
    expect(copy.style.opacity).toBe('');

    fireEvent.click(getByRole('button', { name: '显示说明' }));

    await waitFor(() => expect(copy).toHaveAttribute('data-text-reveal-state', 'pending'));
    enter(group);
    const animation = gsap.getTweensOf(copy)[0];
    act(() => { animation.totalProgress(1); });
    expect(copy).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(copy.style.opacity).toBe('');
  });

  it('waits for a closed details panel to open before registering its reveal copy', async () => {
    const { container, getByRole, getByText } = render(<DetailsHarness />);
    const copy = getByText('图片补充说明');
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="image-detail"]')!;

    expect(copy).not.toHaveAttribute('data-text-reveal-state');
    expect(copy.style.opacity).toBe('');

    fireEvent.click(getByRole('button', { name: '打开图片说明' }));

    await waitFor(() => expect(copy).toHaveAttribute('data-text-reveal-state', 'pending'));
    enter(group);
    const animation = gsap.getTweensOf(copy)[0];
    act(() => { animation.totalProgress(1); });
    expect(copy).toHaveAttribute('data-text-reveal-state', 'revealed');
  });

  it('keeps initial deep-link content readable and reveals later hash targets immediately', () => {
    window.history.replaceState(null, '', '#details');
    const initial = render(<Harness />);
    const initialDetails = initial.container.querySelector<HTMLElement>('#details h3')!;
    expect(initialDetails).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(initialDetails.style.opacity).toBe('');
    initial.unmount();

    window.history.replaceState(null, '', window.location.pathname);
    const later = render(<Harness />);
    const laterDetails = later.container.querySelector<HTMLElement>('#details h3')!;
    expect(Number(laterDetails.style.opacity)).toBe(0);
    window.history.replaceState(null, '', '#details');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(laterDetails).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(laterDetails.style.opacity).toBe('');
  });

  it('does not treat the broad top anchor as permission to consume every unread group', () => {
    window.history.replaceState(null, '', '#top');
    const { container } = render(<Harness />);
    const heading = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"] h2')!;
    const details = container.querySelector<HTMLElement>('[data-text-reveal-group="details"] h3')!;

    expect(heading).toHaveAttribute('data-text-reveal-state', 'pending');
    expect(details).toHaveAttribute('data-text-reveal-state', 'pending');
  });

  it('reveals unread copy entering from above without playing a reverse entrance', () => {
    const { container } = render(<Harness />);
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="details"]')!;
    const heading = group.querySelector<HTMLElement>('h3')!;

    enter(group, -40);

    expect(heading).toHaveAttribute('data-text-reveal-state', 'revealed');
    expect(heading.style.opacity).toBe('');
    expect(gsap.getTweensOf(heading)).toHaveLength(0);
  });

  it('survives StrictMode and restores original inline styles when unmounted mid-reveal', () => {
    const { container, unmount } = render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    const group = container.querySelector<HTMLElement>('[data-text-reveal-group="intro"]')!;
    const heading = group.querySelector<HTMLElement>('h2')!;

    enter(group);
    expect(gsap.getTweensOf(heading)).toHaveLength(1);
    unmount();

    expect(heading.style.opacity).toBe('');
    expect(heading.style.filter).toBe('');
    expect(heading.style.transform).toBe('');
    expect(heading).not.toHaveAttribute('data-text-reveal-state');
  });
});

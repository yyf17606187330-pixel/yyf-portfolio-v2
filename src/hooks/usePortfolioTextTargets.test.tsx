import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';
import { usePortfolioTextTargets } from './usePortfolioTextTargets';

function Page({ expanded = false }: { expanded?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  usePortfolioTextTargets(ref);
  return <div ref={ref}>
    <header><h2>工作方式</h2><p>从策划到成片</p></header>
    <nav><span>导航</span></nav>
    <div className="hero"><p style={{ transform: 'translateY(10px)' }}>首屏自有动效</p></div>
    <p>项目说明 <a href="#work">查看作品</a></p>
    <div><button><span>打开项目</span></button><img alt="作品图" src="/image.webp" /></div>
    <p style={{ opacity: 0.5 }}>已有动画</p>
    <p data-text-reveal>手动标记</p>
    {expanded && <section><h3>新增案例</h3><p>补充说明</p></section>}
  </div>;
}

describe('usePortfolioTextTargets', () => {
  it('marks static copy without replacing links or taking over existing animation and navigation', () => {
    const { unmount } = render(<Page />);
    const title = screen.getByRole('heading', { name: '工作方式' });
    const link = screen.getByRole('link', { name: '查看作品' });
    const manual = screen.getByText('手动标记');
    expect(title).toHaveAttribute('data-text-reveal');
    expect(title.parentElement).toHaveAttribute('data-text-reveal-group');
    expect(link.parentElement).toHaveAttribute('data-text-reveal');
    expect(link).toHaveAttribute('href', '#work');
    expect(screen.getByText('导航')).not.toHaveAttribute('data-text-reveal');
    expect(screen.getByText('首屏自有动效')).not.toHaveAttribute('data-text-reveal');
    expect(screen.getByText('已有动画')).not.toHaveAttribute('data-text-reveal');
    expect(screen.getByRole('button').parentElement).not.toHaveAttribute('data-text-reveal');
    expect(screen.getByText('打开项目')).not.toHaveAttribute('data-text-reveal');
    unmount();
    expect(title).not.toHaveAttribute('data-text-reveal');
    expect(manual).toHaveAttribute('data-text-reveal');
  });

  it('discovers newly rendered copy without replacing existing React-owned text nodes', async () => {
    const { rerender } = render(<Page />);
    const title = screen.getByRole('heading', { name: '工作方式' });
    const text = title.firstChild;
    await act(async () => { rerender(<Page expanded />); });
    expect(screen.getByRole('heading', { name: '新增案例' })).toHaveAttribute('data-text-reveal');
    expect(title.firstChild).toBe(text);
  });
});

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProjectShowcase } from './ProjectShowcase';

describe('ProjectShowcase', () => {
  it('connects both four-film menus to the real media and keeps commercial cases with their employers', () => {
    const onOpenProject = vi.fn();
    const { container } = render(<ProjectShowcase playerOpen={false} onOpenProject={onOpenProject} />);
    const showcase = screen.getByRole('region', { name: '影像与调色作品' });
    expect(showcase).toHaveAttribute('id', 'works');
    expect(within(showcase).queryByRole('heading', { name: '净水器' })).toBeNull();
    const menus = [screen.getByRole('list', { name: '精选影像 / 01目录' }), screen.getByRole('list', { name: '调色作品 / 02目录' })];
    for (const menu of menus) expect(within(menu).getAllByRole('button')).toHaveLength(4);
    expect(container.querySelectorAll('.lazy-preview')).toHaveLength(2);
    expect(container.querySelector('video[src*="full-"]')).toBeNull();
    const opener = screen.getByRole('button', { name: '播放旅拍 Vlog完整作品' });
    fireEvent.click(opener);
    expect(onOpenProject).toHaveBeenCalledWith(expect.objectContaining({ slug: 'travel-vlog', aspectRatio: '2/1' }), opener);
  });

  it('explains the two groups and exposes no internal placeholders', () => {
    render(<ProjectShowcase playerOpen={false} onOpenProject={vi.fn()} />);
    const guide = screen.getByRole('region', { name: '作品区导览' });
    expect(guide).toHaveTextContent('两组精选作品');
    expect(guide).toHaveTextContent('8 项作品');
    const films = screen.getByRole('region', { name: '长片作品' });
    expect(within(films).getByRole('heading', { name: '影像作品与调色作品' })).toBeVisible();
    expect(films).toHaveTextContent('02.01 / LONG-FORM');
    expect(films).toHaveTextContent('02.02 / COLOR GRADING');
    expect(films).not.toHaveTextContent(/待补|待确认|占位|内部说明/);
  });
});
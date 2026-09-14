import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import gsap from 'gsap';
import { aboutContent } from '../../content/about';
import { SkillCards } from './SkillCards';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('SkillCards', () => {
  it('keeps all six categories visible and exposes every approved skill and evidence link on selection', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }));
    const { container } = render(<SkillCards groups={aboutContent.capabilityGroups} />);
    expect(screen.getByRole('list', { name: '能力范围' }).children).toHaveLength(6);
    for (const group of aboutContent.capabilityGroups) {
      const button = screen.getByRole('button', { name: group.title });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);
      const tags = screen.getByRole('list', { name: group.title + '技能' });
      expect(within(tags).getAllByRole('listitem').map((tag) => tag.textContent)).toEqual(group.tags);
      expect(screen.getByRole('link', { name: group.evidence!.label + '：' + group.title }))
        .toHaveAttribute('href', group.evidence!.href);
      expect(document.getElementById(button.getAttribute('aria-controls')!)).toContainElement(tags);
    }
    expect(container.querySelector('[style*="transform"]')).toBeNull();
  });

  it('supports keyboard selection, wrapping and Home/End while keeping focus on the chosen category', () => {
    render(<SkillCards groups={aboutContent.capabilityGroups} />);
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowLeft' });
    expect(buttons[5]).toHaveFocus();
    expect(buttons[5]).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(buttons[5], { key: 'Home' });
    expect(buttons[0]).toHaveFocus();
    fireEvent.keyDown(buttons[0], { key: 'End' });
    expect(buttons[5]).toHaveFocus();
    fireEvent.keyDown(buttons[5], { key: 'ArrowRight' });
    expect(buttons[0]).toHaveFocus();
    expect(screen.getByRole('region', { name: '内容策划' })).toBeInTheDocument();
  });

  it('expands the selected paper in place and removes its link from keyboard access when collapsed', () => {
    render(<SkillCards groups={aboutContent.capabilityGroups} />);
    const button = screen.getByRole('button', { name: '内容策划' });
    expect(screen.queryByRole('region', { name: '内容策划' })).not.toBeInTheDocument();
    fireEvent.click(button);
    const panel = screen.getByRole('region', { name: '内容策划' });
    expect(button.parentElement).toContainElement(panel);
    expect(within(panel).getByRole('link')).toHaveAttribute('href', '#experience-kuwo');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).not.toBeVisible();
    expect(screen.queryByRole('link', { name: '查看商业实践：内容策划' })).not.toBeInTheDocument();
  });

  it('runs the paper entrance once and pauses when offscreen or behind the player', () => {
    let notify: IntersectionObserverCallback;
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', vi.fn((callback: IntersectionObserverCallback) => {
      notify = callback;
      return { observe: vi.fn(), unobserve, disconnect };
    }));
    const groups = aboutContent.capabilityGroups;
    const { container, rerender, unmount } = render(<SkillCards groups={groups} />);
    const root = container.querySelector<HTMLElement>('.skill-collage')!;
    const button = screen.getAllByRole('button')[0];
    const animation = gsap.getTweensOf(button)[0];
    const enter = (visible: boolean) => act(() => notify([{
      isIntersecting: visible, target: root, intersectionRatio: visible ? 1 : 0,
      boundingClientRect: root.getBoundingClientRect(), intersectionRect: root.getBoundingClientRect(),
      rootBounds: null, time: 0,
    }], {} as IntersectionObserver));
    expect(animation.paused()).toBe(true);
    expect(button.style.opacity).toBe('');
    enter(true);
    expect(animation.paused()).toBe(false);
    enter(false);
    expect(animation.paused()).toBe(true);
    enter(true);
    rerender(<SkillCards groups={groups} paused />);
    expect(animation.paused()).toBe(true);
    rerender(<SkillCards groups={groups} />);
    expect(animation.paused()).toBe(false);
    act(() => { animation.totalProgress(1); });
    expect(root).toHaveAttribute('data-entered', 'true');
    expect(unobserve).toHaveBeenCalledWith(root);
    enter(false);
    enter(true);
    expect(animation.totalProgress()).toBe(1);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

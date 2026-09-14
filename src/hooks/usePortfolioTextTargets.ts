import { useLayoutEffect, type RefObject } from 'react';

const candidates = 'h1, h2, h3, h4, p, dt, dd, figcaption, li, span';
const excluded = '.hero, .information-marquee, .player-overlay, .collage-intro, nav, button, summary, .site-header, .long-form-projects__card, .project-media-deck__card, .ai-video-capability__media, [aria-hidden="true"], [data-text-reveal-skip]';

/** Mark text without replacing React-owned nodes or animating media/control wrappers. */
export function usePortfolioTextTargets(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const marked = new Set<HTMLElement>();
    const groups = new Set<HTMLElement>();
    const mark = () => {
      for (const target of root.querySelectorAll<HTMLElement>(candidates)) {
        if (target.closest(excluded) || target.hasAttribute('data-text-reveal')) continue;
        if (target.parentElement?.closest('[data-text-reveal]')) continue;
        if (target.querySelector('img, video, button, input, ul, ol, dl, h1, h2, h3, h4, p, figure')) continue;
        if (![...target.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) continue;
        if (target.style.transform || target.style.opacity || target.style.filter) continue;
        target.setAttribute('data-text-reveal', '');
        marked.add(target);
      }
      const parents = new Set([...marked].map((target) => target.parentElement));
      for (const parent of parents) {
        if (!parent || parent.closest(excluded) || parent.hasAttribute('data-text-reveal-group')) continue;
        if (!parent.matches('div, header, article') || parent.querySelector('img, video')) continue;
        const directTargets = [...parent.children].filter((child) => child.hasAttribute('data-text-reveal'));
        if (directTargets.length < 2 || directTargets.length > 6) continue;
        if (parent.getBoundingClientRect().height > window.innerHeight * 0.75) continue;
        parent.setAttribute('data-text-reveal-group', '');
        groups.add(parent);
      }
    };
    mark();
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(mark);
    observer?.observe(root, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      for (const target of marked) target.removeAttribute('data-text-reveal');
      for (const group of groups) group.removeAttribute('data-text-reveal-group');
    };
  }, [rootRef]);
}

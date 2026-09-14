import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './textReveal.css';

const TARGET_SELECTOR = '[data-text-reveal]';
const GROUP_SELECTOR = '[data-text-reveal-group]';

type RevealState = 'pending' | 'animating' | 'revealed';

interface InlineStyleSnapshot {
  filter: string;
  opacity: string;
  transform: string;
  willChange: string;
}

interface RevealUnit {
  animation: gsap.core.Tween | null;
  element: HTMLElement;
  queued: boolean;
  state: RevealState;
  targets: Set<HTMLElement>;
}

interface TextRevealController {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
}

export interface TextRevealOptions {
  enabled: boolean;
  paused?: boolean;
}

function getHashTarget(): HTMLElement | null {
  if (typeof window === 'undefined' || !window.location.hash || window.location.hash === '#top') return null;
  try {
    return document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
  } catch {
    return null;
  }
}

function shouldUseLightweightMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  const limitedCpu = typeof navigator.hardwareConcurrency === 'number'
    && navigator.hardwareConcurrency > 0
    && navigator.hardwareConcurrency <= 4;
  return limitedCpu
    || window.matchMedia('(pointer: coarse)').matches
    || window.matchMedia('(update: slow)').matches;
}

function isAvailableForReveal(element: HTMLElement): boolean {
  if (element.closest('[hidden]')) return false;
  let ancestor: HTMLElement | null = element;
  while (ancestor) {
    if (ancestor instanceof HTMLDetailsElement && !ancestor.open) {
      const summary = [...ancestor.children].find((child) => child instanceof HTMLElement
        && child.tagName === 'SUMMARY');
      if (!summary?.contains(element)) return false;
    }
    ancestor = ancestor.parentElement;
  }
  return true;
}

function createTextRevealController(
  root: HTMLElement,
  initialPaused: boolean,
  previouslyRevealed: WeakSet<HTMLElement>,
): TextRevealController {
  const lightweight = shouldUseLightweightMotion();
  const units = new Map<HTMLElement, RevealUnit>();
  const targetUnits = new Map<HTMLElement, RevealUnit>();
  const snapshots = new Map<HTMLElement, InlineStyleSnapshot>();
  const observed = new Set<HTMLElement>();
  let destroyed = false;
  let optionPaused = initialPaused;
  let windowFocused = true;

  root.dataset.textRevealController = 'active';

  const isPaused = () => optionPaused || !windowFocused || document.visibilityState !== 'visible';

  const rememberStyle = (target: HTMLElement) => {
    if (snapshots.has(target)) return;
    snapshots.set(target, {
      filter: target.style.filter,
      opacity: target.style.opacity,
      transform: target.style.transform,
      willChange: target.style.willChange,
    });
  };

  const restoreStyle = (target: HTMLElement) => {
    const snapshot = snapshots.get(target);
    if (!snapshot) return;
    target.style.filter = snapshot.filter;
    target.style.opacity = snapshot.opacity;
    target.style.transform = snapshot.transform;
    target.style.willChange = snapshot.willChange;
  };

  const setGroupState = (unit: RevealUnit, state: RevealState) => {
    if (unit.element.hasAttribute('data-text-reveal-group')) {
      unit.element.dataset.textRevealGroupState = state;
    }
  };

  const setTargetRevealed = (target: HTMLElement) => {
    restoreStyle(target);
    target.dataset.textRevealState = 'revealed';
    previouslyRevealed.add(target);
  };

  const finishUnit = (unit: RevealUnit) => {
    if (destroyed || unit.state === 'revealed') return;
    unit.animation?.kill();
    unit.animation = null;
    unit.queued = false;
    for (const target of unit.targets) setTargetRevealed(target);
    unit.state = 'revealed';
    setGroupState(unit, 'revealed');
    if (observed.delete(unit.element)) observer.unobserve(unit.element);
  };

  const animateUnit = (unit: RevealUnit) => {
    if (destroyed || unit.state !== 'pending') return;
    if (isPaused()) {
      unit.queued = true;
      return;
    }

    const targets = [...unit.targets].filter((target) => !previouslyRevealed.has(target));
    if (targets.length === 0) {
      finishUnit(unit);
      return;
    }

    unit.queued = false;
    unit.state = 'animating';
    setGroupState(unit, 'animating');
    for (const target of targets) target.dataset.textRevealState = 'animating';
    const animation = gsap.to(targets, {
      duration: lightweight ? 0.58 : 0.82,
      ease: 'power3.out',
      filter: 'blur(0px)',
      opacity: 1,
      stagger: lightweight ? 0.045 : 0.085,
      y: 0,
      onComplete: () => finishUnit(unit),
    });
    unit.animation = animation;
  };

  const syncPausedState = () => {
    if (destroyed) return;
    const paused = isPaused();
    for (const unit of units.values()) unit.animation?.paused(paused);
    if (!paused) {
      for (const unit of units.values()) {
        if (unit.queued) animateUnit(unit);
      }
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (destroyed) return;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const unit = units.get(entry.target as HTMLElement);
      if (!unit || unit.state === 'revealed') continue;
      if (entry.boundingClientRect.top < 0) finishUnit(unit);
      else animateUnit(unit);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  const markPending = (target: HTMLElement) => {
    rememberStyle(target);
    target.dataset.textRevealState = 'pending';
    gsap.set(target, {
      filter: `blur(${lightweight ? 10 : 18}px)`,
      opacity: 0,
      y: lightweight ? 14 : 26,
    });
  };

  const unregisterTarget = (target: HTMLElement) => {
    const unit = targetUnits.get(target);
    if (!unit) return;
    unit.animation?.kill();
    unit.animation = null;
    unit.queued = false;
    unit.targets.delete(target);
    targetUnits.delete(target);
    restoreStyle(target);
    delete target.dataset.textRevealState;

    if (unit.targets.size === 0) {
      if (observed.delete(unit.element)) observer.unobserve(unit.element);
      delete unit.element.dataset.textRevealGroupState;
      units.delete(unit.element);
      return;
    }

    const pendingTargets = [...unit.targets].filter((candidate) => !previouslyRevealed.has(candidate));
    if (pendingTargets.length === 0) {
      unit.state = 'revealed';
      setGroupState(unit, 'revealed');
      if (observed.delete(unit.element)) observer.unobserve(unit.element);
      return;
    }

    unit.state = 'pending';
    for (const candidate of pendingTargets) {
      restoreStyle(candidate);
      markPending(candidate);
    }
    setGroupState(unit, 'pending');
    observePendingUnit(unit);
  };

  const unitMatchesHash = (unit: RevealUnit, hashTarget: HTMLElement | null) => {
    if (!hashTarget) return false;
    if (unit.element === hashTarget || unit.element.contains(hashTarget)) return true;
    if (!hashTarget.contains(unit.element)) return false;
    const bounds = unit.element.getBoundingClientRect();
    return bounds.top >= 0 && bounds.top < window.innerHeight;
  };

  const shouldStartVisible = (unit: RevealUnit) => {
    if (unitMatchesHash(unit, getHashTarget())) return true;
    if (window.scrollY <= 0) return false;
    const bounds = unit.element.getBoundingClientRect();
    return bounds.top < window.innerHeight;
  };

  const observePendingUnit = (unit: RevealUnit) => {
    if (unit.state !== 'pending' || observed.has(unit.element)) return;
    observed.add(unit.element);
    observer.observe(unit.element);
  };

  const registerUnit = (
    element: HTMLElement,
    targets: HTMLElement[],
    allowInitialPositionRestore: boolean,
  ) => {
    let unit = units.get(element);
    if (!unit) {
      unit = {
        animation: null,
        element,
        queued: false,
        state: 'pending',
        targets: new Set(),
      };
      units.set(element, unit);
    }

    for (const target of targets) {
      if (targetUnits.has(target)) continue;
      unit.targets.add(target);
      targetUnits.set(target, unit);
      if (unit.state === 'revealed' || unit.state === 'animating' || previouslyRevealed.has(target)) {
        setTargetRevealed(target);
      } else {
        markPending(target);
      }
    }

    if (unit.targets.size === 0) return;
    if ([...unit.targets].every((target) => previouslyRevealed.has(target))) {
      unit.state = 'revealed';
      setGroupState(unit, 'revealed');
      return;
    }
    if (unit.state !== 'pending') return;
    setGroupState(unit, unit.state);
    if (allowInitialPositionRestore && shouldStartVisible(unit)) finishUnit(unit);
    else observePendingUnit(unit);
  };

  const refreshTargets = (allowInitialPositionRestore = false) => {
    if (destroyed) return;
    for (const target of [...targetUnits.keys()]) {
      if (!root.contains(target) || !target.matches(TARGET_SELECTOR)) unregisterTarget(target);
    }
    const targets = [...root.querySelectorAll<HTMLElement>(TARGET_SELECTOR)]
      .filter(isAvailableForReveal);
    const groups = [...root.querySelectorAll<HTMLElement>(GROUP_SELECTOR)]
      .filter(isAvailableForReveal);

    for (const group of groups) {
      const groupTargets = targets.filter((target) => target.closest(GROUP_SELECTOR) === group);
      registerUnit(group, groupTargets, allowInitialPositionRestore);
    }
    for (const target of targets) {
      if (!target.closest(GROUP_SELECTOR)) {
        registerUnit(target, [target], allowInitialPositionRestore);
      }
    }
  };

  const revealHashTarget = () => {
    const hashTarget = getHashTarget();
    if (!hashTarget) return;
    for (const unit of units.values()) {
      if (unitMatchesHash(unit, hashTarget)) finishUnit(unit);
    }
  };

  const handleFocusIn = (event: FocusEvent) => {
    const focused = event.target;
    if (!(focused instanceof HTMLElement)) return;
    refreshTargets();
    const affected = new Set<RevealUnit>();
    for (const [target, unit] of targetUnits) {
      if (target === focused || target.contains(focused) || focused.contains(target)) affected.add(unit);
    }
    for (const unit of affected) finishUnit(unit);
  };

  const handleVisibilityChange = () => syncPausedState();
  const handleWindowBlur = () => {
    windowFocused = false;
    syncPausedState();
  };
  const handleWindowFocus = () => {
    windowFocused = true;
    syncPausedState();
  };
  const handleHashChange = () => {
    refreshTargets();
    revealHashTarget();
  };
  const mutationObserver = typeof MutationObserver === 'undefined'
    ? null
    : new MutationObserver(() => refreshTargets());

  root.addEventListener('focusin', handleFocusIn);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('hashchange', handleHashChange);
  mutationObserver?.observe(root, {
    attributeFilter: ['data-text-reveal', 'hidden', 'open'],
    attributes: true,
    childList: true,
    subtree: true,
  });
  refreshTargets(true);
  revealHashTarget();

  return {
    setPaused(paused) {
      optionPaused = paused;
      syncPausedState();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer.disconnect();
      mutationObserver?.disconnect();
      root.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('hashchange', handleHashChange);
      for (const unit of units.values()) {
        unit.animation?.kill();
        unit.animation = null;
      }
      for (const target of targetUnits.keys()) {
        restoreStyle(target);
        delete target.dataset.textRevealState;
      }
      for (const unit of units.values()) delete unit.element.dataset.textRevealGroupState;
      delete root.dataset.textRevealController;
    },
  };
}

/**
 * Reveals explicitly marked text once as it enters the viewport.
 * Add `data-text-reveal` to static text leaves and optionally place related
 * leaves inside `data-text-reveal-group` so their DOM order drives the stagger.
 * Do not mark containers whose transform or opacity is controlled elsewhere.
 */
export function useTextReveal(
  rootRef: RefObject<HTMLElement | null>,
  { enabled, paused = false }: TextRevealOptions,
) {
  const controllerRef = useRef<TextRevealController | null>(null);
  const pausedRef = useRef(paused);
  const revealedRef = useRef(new WeakSet<HTMLElement>());
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  pausedRef.current = paused;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || reducedMotion || typeof IntersectionObserver === 'undefined') {
      controllerRef.current = null;
      return undefined;
    }

    const controller = createTextRevealController(root, pausedRef.current, revealedRef.current);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [enabled, reducedMotion, rootRef]);

  useLayoutEffect(() => {
    controllerRef.current?.setPaused(paused);
  }, [paused]);
}

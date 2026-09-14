import { useEffect, useRef, type RefObject } from 'react';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true',
  );
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
  restoreFocus?: HTMLElement | null,
) {
  const escapeHandlerRef = useRef(onEscape);

  useEffect(() => {
    escapeHandlerRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const container = containerRef.current;
    const previousFocus = restoreFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    if (!container) {
      return undefined;
    }

    const focusInitialControl = () => {
      const fallback = getFocusableElements(container)[0];
      const initialControl = initialFocusRef?.current ?? fallback ?? container;
      initialControl.focus({ preventScroll: true });
    };

    focusInitialControl();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        escapeHandlerRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(container);

      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const activeElementIsFocusable = activeElement instanceof HTMLElement
        && focusable.includes(activeElement);

      if (container.contains(activeElement) && !activeElementIsFocusable) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && (activeElement === first || !container.contains(activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || !container.contains(activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [active, containerRef, initialFocusRef, restoreFocus]);
}

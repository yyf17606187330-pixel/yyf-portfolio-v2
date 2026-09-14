export const INTRO_SESSION_KEY = 'yyf-paper-intro-seen';

export function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.location.hash && window.location.hash !== '#top') return false;
  if (window.scrollY > 0) return false;
  if (new URLSearchParams(window.location.search).get('intro') === '1') return true;
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
  } catch {
    return true;
  }
}

export function rememberIntro() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    // Storage may be unavailable; entering the portfolio must still work.
  }
}

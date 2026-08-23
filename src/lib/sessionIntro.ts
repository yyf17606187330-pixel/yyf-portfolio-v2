export const INTRO_SESSION_KEY = 'yyf-portfolio-intro-played';

export type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function getSessionStorage(): SessionStorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function shouldPlayIntro(storage: SessionStorageLike | null, reduceMotion: boolean): boolean {
  if (reduceMotion) {
    return false;
  }

  try {
    return storage?.getItem(INTRO_SESSION_KEY) !== 'true';
  } catch {
    return true;
  }
}

export function markIntroPlayed(storage: SessionStorageLike | null): void {
  try {
    storage?.setItem(INTRO_SESSION_KEY, 'true');
  } catch {
    // Storage can be blocked by privacy settings; completion must remain usable.
  }
}

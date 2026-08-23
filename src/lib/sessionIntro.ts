export const INTRO_SESSION_KEY = 'yyf-portfolio-intro-played';

export type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function shouldPlayIntro(storage: SessionStorageLike, reduceMotion: boolean): boolean {
  return !reduceMotion && storage.getItem(INTRO_SESSION_KEY) !== 'true';
}

export function markIntroPlayed(storage: SessionStorageLike): void {
  storage.setItem(INTRO_SESSION_KEY, 'true');
}

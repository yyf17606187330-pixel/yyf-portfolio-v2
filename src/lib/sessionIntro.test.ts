import { describe, expect, it } from 'vitest';
import { markIntroPlayed, shouldPlayIntro } from './sessionIntro';

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('session intro state', () => {
  it('plays only once in the current session', () => {
    const storage = createStorage();

    expect(shouldPlayIntro(storage, false)).toBe(true);
    markIntroPlayed(storage);
    expect(shouldPlayIntro(storage, false)).toBe(false);
    expect(shouldPlayIntro(createStorage(), false)).toBe(true);
  });

  it('does not play when reduced motion is requested', () => {
    expect(shouldPlayIntro(createStorage(), true)).toBe(false);
  });
});

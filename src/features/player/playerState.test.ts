import { describe, expect, it } from 'vitest';
import { initialPlayerState, playerReducer } from './playerState';

describe('playerReducer', () => {
  it('opens a project in an audible playing state', () => {
    expect(playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' })).toEqual({
      activeSlug: 'film-01',
      isPlaying: true,
      isMuted: false,
    });
  });

  it('closes an open project back to the deterministic initial state', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });

    expect(playerReducer(openState, { type: 'close' })).toEqual(initialPlayerState);
  });

  it('toggles playback without changing the active project', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });

    expect(playerReducer(openState, { type: 'toggle-playback' })).toEqual({
      activeSlug: 'film-01',
      isPlaying: false,
      isMuted: false,
    });
  });

  it('toggles mute only while a project is active', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });

    expect(playerReducer(openState, { type: 'toggle-muted' })).toEqual({
      activeSlug: 'film-01',
      isPlaying: true,
      isMuted: true,
    });
    expect(playerReducer(initialPlayerState, { type: 'toggle-muted' })).toBe(initialPlayerState);
  });
});

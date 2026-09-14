import { describe, expect, it } from 'vitest';
import { initialPlayerState, playerReducer } from './playerState';

describe('playerReducer', () => {
  it('opens a project in a pending non-playing and audible state', () => {
    expect(playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' })).toEqual({
      activeSlug: 'film-01',
      isPlaying: false,
      isMuted: false,
    });
  });

  it('tracks confirmed playback and pause media events for the active project', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });
    const playingState = playerReducer(openState, { type: 'playing' });

    expect(playingState.isPlaying).toBe(true);
    expect(playerReducer(playingState, { type: 'paused' }).isPlaying).toBe(false);
  });

  it('closes an open project back to the deterministic initial state', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });

    expect(playerReducer(openState, { type: 'close' })).toEqual(initialPlayerState);
  });

  it('toggles mute only while a project is active', () => {
    const openState = playerReducer(initialPlayerState, { type: 'open', slug: 'film-01' });

    expect(playerReducer(openState, { type: 'toggle-muted' })).toEqual({
      activeSlug: 'film-01',
      isPlaying: false,
      isMuted: true,
    });
    expect(playerReducer(initialPlayerState, { type: 'toggle-muted' })).toBe(initialPlayerState);
  });
});

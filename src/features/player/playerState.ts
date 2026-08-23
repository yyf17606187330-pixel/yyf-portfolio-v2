export interface PlayerState {
  activeSlug: string | null;
  isPlaying: boolean;
  isMuted: boolean;
}

export type PlayerEvent =
  | { type: 'open'; slug: string }
  | { type: 'close' }
  | { type: 'playing' }
  | { type: 'paused' }
  | { type: 'toggle-muted' };

export const initialPlayerState: PlayerState = {
  activeSlug: null,
  isPlaying: false,
  isMuted: false,
};

export function playerReducer(state: PlayerState, event: PlayerEvent): PlayerState {
  switch (event.type) {
    case 'open':
      return { activeSlug: event.slug, isPlaying: false, isMuted: false };
    case 'close':
      return initialPlayerState;
    case 'playing':
      return state.activeSlug ? { ...state, isPlaying: true } : state;
    case 'paused':
      return state.activeSlug ? { ...state, isPlaying: false } : state;
    case 'toggle-muted':
      return state.activeSlug ? { ...state, isMuted: !state.isMuted } : state;
  }
}

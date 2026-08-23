export interface PlayerState {
  activeSlug: string | null;
  isPlaying: boolean;
  isMuted: boolean;
}

export type PlayerEvent =
  | { type: 'open'; slug: string }
  | { type: 'close' }
  | { type: 'toggle-playback' }
  | { type: 'toggle-muted' };

export const initialPlayerState: PlayerState = {
  activeSlug: null,
  isPlaying: false,
  isMuted: false,
};

export function playerReducer(state: PlayerState, event: PlayerEvent): PlayerState {
  switch (event.type) {
    case 'open':
      return { activeSlug: event.slug, isPlaying: true, isMuted: false };
    case 'close':
      return initialPlayerState;
    case 'toggle-playback':
      return state.activeSlug ? { ...state, isPlaying: !state.isPlaying } : state;
    case 'toggle-muted':
      return state.activeSlug ? { ...state, isMuted: !state.isMuted } : state;
  }
}

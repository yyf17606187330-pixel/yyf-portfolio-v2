import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMediaUrl } from './media';

describe('resolveMediaUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['', '   ', 'javascript:alert(1)', '//cdn.example.com/video.mp4', '../private.mp4', 'folder/../../private.mp4', 'ftp://example.com/video.mp4'])(
    'returns null for an unsafe or empty media value: %s',
    (path) => {
      expect(resolveMediaUrl(path, 'https://cdn.example.com/media')).toBeNull();
    },
  );

  it('joins a relative media path with a base URL without duplicate or missing slashes', () => {
    expect(resolveMediaUrl('/posters/film-01.webp', 'https://cdn.example.com/media/')).toBe(
      'https://cdn.example.com/media/posters/film-01.webp',
    );
  });

  it('uses the configured media base URL when no base is passed', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://cdn.example.com/portfolio/');

    expect(resolveMediaUrl('posters/film-01.webp')).toBe('https://cdn.example.com/portfolio/posters/film-01.webp');
  });

  it('falls back safely when no media base URL is configured', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', undefined);

    expect(resolveMediaUrl('posters/film-01.webp')).toBe('/media/posters/film-01.webp');
  });

  it('falls back safely when the configured media base URL is empty or unsafe', () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', '');
    expect(resolveMediaUrl('posters/film-01.webp')).toBe('/media/posters/film-01.webp');

    vi.stubEnv('VITE_MEDIA_BASE_URL', 'javascript:alert(1)');
    expect(resolveMediaUrl('posters/film-01.webp')).toBe('/media/posters/film-01.webp');
  });

  it.each(['\\\\evil.example', 'media\\archive', 'media%5Carchive'])(
    'falls back for an ambiguous base URL: %s',
    (baseUrl) => {
      expect(resolveMediaUrl('posters/film-01.webp', baseUrl)).toBe('/media/posters/film-01.webp');
    },
  );

  it('preserves approved HTTPS and image data URLs', () => {
    expect(resolveMediaUrl('https://cdn.example.com/poster.webp')).toBe('https://cdn.example.com/poster.webp');
    expect(resolveMediaUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe('data:image/svg+xml;base64,PHN2Zy8+');
  });
});

import { describe, expect, it } from 'vitest';
import { resolveMediaUrl } from './media';

describe('resolveMediaUrl', () => {
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

  it('preserves approved HTTPS and image data URLs', () => {
    expect(resolveMediaUrl('https://cdn.example.com/poster.webp')).toBe('https://cdn.example.com/poster.webp');
    expect(resolveMediaUrl('data:image/svg+xml;base64,PHN2Zy8+')).toBe('data:image/svg+xml;base64,PHN2Zy8+');
  });
});

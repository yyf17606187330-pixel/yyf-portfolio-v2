const dataImagePattern = /^data:image\/[a-z0-9.+-]+(?:;[a-z0-9=:+-]+)*,/i;
const schemePattern = /^[a-z][a-z0-9+.-]*:/i;
const fallbackMediaBaseUrl = '/media/';

function containsTraversal(path: string): boolean {
  return path.split('/').some((segment) => {
    try {
      const decodedSegment = decodeURIComponent(segment);
      return decodedSegment.includes('\\') || decodedSegment.split(/[\\/]/).some((part) => part === '.' || part === '..');
    } catch {
      return true;
    }
  });
}

function resolveMediaBaseUrl(baseUrl?: string): string {
  const candidate = (baseUrl ?? import.meta.env.VITE_MEDIA_BASE_URL ?? '').trim();

  if (!candidate || candidate.startsWith('//') || candidate.includes('?') || candidate.includes('#') || containsTraversal(candidate)) {
    return fallbackMediaBaseUrl;
  }

  if (schemePattern.test(candidate)) {
    try {
      if (new URL(candidate).protocol !== 'https:') {
        return fallbackMediaBaseUrl;
      }
    } catch {
      return fallbackMediaBaseUrl;
    }
  }

  return candidate === '/' ? candidate : `${candidate.replace(/\/+$/, '')}/`;
}

export function resolveMediaUrl(path: string, baseUrl?: string): string | null {
  const mediaPath = path.trim();

  if (!mediaPath || mediaPath.startsWith('//') || containsTraversal(mediaPath)) {
    return null;
  }

  if (dataImagePattern.test(mediaPath)) {
    return mediaPath;
  }

  if (schemePattern.test(mediaPath)) {
    return mediaPath.startsWith('https://') ? mediaPath : null;
  }

  const normalizedPath = mediaPath.replace(/^\/+/, '');

  if (!normalizedPath) {
    return null;
  }

  const normalizedBase = resolveMediaBaseUrl(baseUrl);

  return `${normalizedBase}${normalizedPath}`;
}

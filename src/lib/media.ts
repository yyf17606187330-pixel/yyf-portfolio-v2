const dataImagePattern = /^data:image\/[a-z0-9.+-]+(?:;[a-z0-9=:+-]+)*,/i;
const schemePattern = /^[a-z][a-z0-9+.-]*:/i;

function containsTraversal(path: string): boolean {
  return path.split('/').some((segment) => {
    try {
      const decodedSegment = decodeURIComponent(segment);
      return decodedSegment === '.' || decodedSegment === '..' || decodedSegment.includes('\\');
    } catch {
      return true;
    }
  });
}

export function resolveMediaUrl(path: string, baseUrl = '/media/'): string | null {
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

  const normalizedBase = baseUrl.trim().replace(/\/+$/, '');
  const normalizedPath = mediaPath.replace(/^\/+/, '');

  return `${normalizedBase}/${normalizedPath}`;
}

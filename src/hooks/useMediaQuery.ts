import { useEffect, useState } from 'react';

function getMatches(query: string): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => getMatches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);

    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}

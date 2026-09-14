import { useEffect, useState } from 'react';

function getPageVisibility(): boolean {
  return typeof document === 'undefined' || document.visibilityState !== 'hidden';
}

export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(getPageVisibility);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(getPageVisibility());

    document.addEventListener('visibilitychange', updateVisibility);

    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return isVisible;
}

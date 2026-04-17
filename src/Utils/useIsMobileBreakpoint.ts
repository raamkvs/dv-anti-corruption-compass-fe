import { useEffect, useState } from 'react';

// Reuse the Tailwind `lg` breakpoint (1024px) as the desktop/mobile boundary.
const DESKTOP_MIN_WIDTH = 1024;

export function useIsMobileBreakpoint() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.innerWidth < DESKTOP_MIN_WIDTH,
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < DESKTOP_MIN_WIDTH);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}

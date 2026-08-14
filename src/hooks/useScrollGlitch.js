import { useEffect } from 'react';

/* Toggles .is-scrolling on <body> while the user scrolls (drives CSS glitch). */
export function useScrollGlitch() {
  useEffect(() => {
    let timeout;
    const onScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(timeout);
      timeout = setTimeout(() => document.body.classList.remove('is-scrolling'), 160);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timeout);
    };
  }, []);
}

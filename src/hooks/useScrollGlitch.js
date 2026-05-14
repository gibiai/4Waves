import { useEffect } from 'react';

export function useScrollGlitch() {
  useEffect(() => {
    let scrollTimeout;

    const handleScroll = () => {
      // Add class when scrolling
      document.body.classList.add('is-scrolling');

      // Clear the timeout throughout the scroll
      window.clearTimeout(scrollTimeout);

      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150); // 150ms after scroll ends, remove glitch
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);
}

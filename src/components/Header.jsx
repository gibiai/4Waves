import { useEffect, useRef } from 'react';

/* CSS-3D extruded wordmark: tilts with scroll + mouse, floats on idle */
function Logo3D() {
  const ref = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const p = Math.min(window.scrollY / max, 1);
        const t = performance.now() / 1000;
        const rx = -10 + Math.sin(t * 0.8) * 4 + p * 32;
        const ry = 12 + Math.sin(t * 0.55) * 6 - p * 26;
        el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toTop = () => {
    window.__fourwavesBurst?.(0.6);
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={toTop}
      aria-label="4Waves, back to top"
      className="cursor-pointer shrink-0"
      style={{ perspective: '600px' }}
    >
      <span
        ref={ref}
        className="logo-3d block font-inter font-extrabold text-2xl md:text-4xl tracking-tight select-none"
      >
        4Waves
      </span>
    </button>
  );
}

export default function Header() {
  const links = [
    { label: 'Projects', id: 'projects' },
    { label: 'About', id: 'about' },
    { label: 'Contact Us', id: 'contact' },
  ];

  const scrollToSection = (id) => {
    window.__fourwavesBurst?.(0.6);
    if (window.__lenis) {
      window.__lenis.scrollTo(`#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center gap-2 px-4 md:px-16 pt-4 md:pt-8">
      <Logo3D />

      {/* Nav — tutti i link in un unico bottone bordato */}
      <nav className="flex items-center gap-3 md:gap-8 px-3 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/20 transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_12px_rgba(94,210,156,0.3)] font-instrument shrink-0">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="text-[10px] md:text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-wider md:tracking-widest cursor-pointer relative group"
          >
            {link.label}
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-glow transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
      </nav>
    </div>
  );
}

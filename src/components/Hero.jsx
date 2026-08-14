import { useEffect, useState } from 'react';

export default function Hero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const scrollTo = (id) => {
    window.__fourwavesBurst?.(0.9);
    if (window.__lenis) {
      window.__lenis.scrollTo(`#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
      {/* scrim for text readability over the bright scene */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-primary/80 via-primary/35 to-transparent" />

      <div
        className="relative px-6 md:px-24 pt-28 md:pt-20 transition-all duration-1000 ease-out"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(40px)',
        }}
      >
        <p className="font-inter font-semibold text-[10px] md:text-xs uppercase tracking-[0.45em] mb-4 md:mb-6 text-glow" aria-label="Signal online">
          {'SIGNAL ONLINE'.split('').map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className="inline-block w-3" />
            ) : (
              <span
                key={i}
                className="frag-letter inline-block"
                style={{ animationDelay: `${((i * 0.53) % 2.9).toFixed(2)}s` }}
              >
                {ch}
              </span>
            )
          )}
        </p>

        <h1 className="font-inter font-extrabold uppercase leading-[0.9] select-none">
          <span
            className="block text-[15vw] md:text-[9vw] outline-text glitch-text"
            data-text="FOUR"
          >
            Four
          </span>
          <span
            className="block text-[9vw] md:text-[6.2vw] animated-gradient-text glitch-text mt-1"
            data-text="DIMENSIONS"
          >
            Dimensions
          </span>
          <span className="block text-[5vw] md:text-[2.6vw] tracking-[0.42em] text-white/90 mt-3 md:mt-5 glow-mint">
            One Signal.
          </span>
        </h1>

        <p className="mt-5 md:mt-7 max-w-lg text-sm md:text-base font-inter font-medium leading-relaxed text-white/60">
          We tune technology to the frequency of your ambition:{' '}
          <span className="text-glow">amplitude</span>,{' '}
          <span className="text-[#b9a8ff]">wavelength</span>,{' '}
          <span className="text-[#b14eff]">phase</span> and{' '}
          <span className="text-accent">time</span>, phase-locked into products that resonate.
        </p>

        <div className="mt-8 md:mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => scrollTo('projects')}
            className="px-6 py-3 rounded-md border border-glow text-glow font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-glow hover:text-primary transition-colors cursor-pointer"
          >
            Explore Projects
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="px-6 py-3 rounded-md border border-white/20 text-white/70 font-bold uppercase tracking-widest text-xs md:text-sm hover:border-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Start Transmission
          </button>
        </div>
      </div>
    </section>
  );
}

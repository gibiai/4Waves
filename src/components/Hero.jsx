import { useState, useEffect } from 'react';
import SketchfabEmbed from './SketchfabEmbed';

const LOADING_ID = '22593732efaa4bc194cb0d9d059bf439';

export default function Hero() {
  const [textReady, setTextReady] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIframeReady(true), 200);
    const t2 = setTimeout(() => setTextReady(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Modello 3D — full bg su mobile, metà destra su desktop */}
      <div
        className="absolute inset-0 md:left-auto md:right-0 md:w-[62%] transition-all duration-1000 ease-out"
        style={{
          opacity: iframeReady ? 1 : 0,
          transform: iframeReady ? 'scale(1)' : 'scale(1.08)',
        }}
      >
        <SketchfabEmbed modelId={LOADING_ID} autospin={0.2} revealDelay={3200} />
      </div>

      {/* Gradient leggibilità */}
      <div className="absolute inset-0 pointer-events-none z-10
        bg-gradient-to-r from-[#0D081A] via-[#0D081A]/90
        md:from-[#0D081A] md:via-[#0D081A]/80 md:via-40% md:to-transparent" />

      {/* Testo hero
          pt-28 = spazio per header fisso su mobile portrait
          landscape: testo più piccolo, niente padding verticale extra */}
      <div
        className="relative z-20 flex flex-col items-start text-left
                   px-8 md:px-24 w-full md:w-1/2
                   pt-28 md:pt-0
                   transition-all duration-700 ease-out"
        style={{
          opacity: textReady ? 1 : 0,
          transform: textReady ? 'translateY(0)' : 'translateY(28px)',
        }}
      >
        <p className="font-inter font-semibold text-xs md:text-base uppercase tracking-[0.2em] mb-2 md:mb-4 text-accent">
          Four Frequencies
        </p>

        <h1
          className="text-4xl landscape:text-3xl md:text-7xl lg:text-8xl
                     leading-[1.1] tracking-tight font-inter font-bold
                     mb-3 md:mb-6 uppercase glitch-text animated-gradient-text glass-text-stroke"
          data-text="ZERO DOWNTIME"
        >
          Zero <br />
          Downtime
        </h1>

        <p
          className="text-sm landscape:text-xs md:text-lg font-inter font-medium max-w-md leading-relaxed"
          style={{
            background: 'linear-gradient(90deg, #5ED29C, #9D4EDD)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Four frequencies tuned to your growth,<br />
          one steady signal that never drops.
        </p>
      </div>
    </section>
  );
}

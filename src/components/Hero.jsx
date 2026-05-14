import { useState, useEffect } from 'react';
import SketchfabEmbed from './SketchfabEmbed';

// Loading — 22593732efaa4bc194cb0d9d059bf439
const LOADING_ID = '22593732efaa4bc194cb0d9d059bf439';

export default function Hero() {
  const [textReady, setTextReady] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);

  // Testo appare dopo che l'iframe ha avuto il tempo di caricare
  useEffect(() => {
    const t1 = setTimeout(() => setIframeReady(true), 300);
    const t2 = setTimeout(() => setTextReady(true), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Modello 3D destra — scala + fade in */}
      <div
        className="absolute right-0 top-0 w-full md:w-[62%] h-full transition-all duration-1000 ease-out"
        style={{
          opacity: iframeReady ? 1 : 0,
          transform: iframeReady ? 'scale(1)' : 'scale(1.08)',
        }}
      >
        <SketchfabEmbed modelId={LOADING_ID} autospin={0.2} />
      </div>

      {/* Gradient sinistra per leggibilità testo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D081A] via-[#0D081A]/80 via-40% to-transparent pointer-events-none z-10" />

      {/* Testo hero */}
      <div
        className="relative z-20 flex flex-col items-start text-left px-8 md:px-24 w-full md:w-1/2 transition-all duration-700 ease-out"
        style={{
          opacity: textReady ? 1 : 0,
          transform: textReady ? 'translateY(0)' : 'translateY(28px)',
        }}
      >
        <p className="font-inter font-semibold text-sm md:text-base uppercase tracking-[0.2em] mb-4 text-accent">
          Four Frequencies
        </p>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight font-inter font-bold mb-6 uppercase glitch-text animated-gradient-text glass-text-stroke"
          data-text="ZERO DOWNTIME"
        >
          Zero <br />
          Downtime
        </h1>

        <p
          className="text-base md:text-lg font-inter font-medium max-w-md leading-relaxed"
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

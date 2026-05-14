import { useState, useEffect, useRef } from 'react';
import SketchfabEmbed from '../SketchfabEmbed';

export default function Section({
  id,
  title,
  children,
  modelId,          // Sketchfab model ID
  autospin = 0,
  overlayOpacity = 0.5,
  cardDelay = 2200, // ms dopo l'entrata in viewport → card appare
}) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [visible]);

  // Card appare dopo cardDelay ms dall'entrata in viewport
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setCardReady(true), cardDelay);
    return () => clearTimeout(t);
  }, [visible, cardDelay]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-8 md:px-24 py-24 overflow-hidden"
    >
      {/* Sfondo Sketchfab — scale+fade all'entrata */}
      {modelId && (
        <div className="absolute inset-0 w-full h-full">
          {visible && (
            <div
              className="w-full h-full transition-all duration-1000 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(1.06)',
              }}
            >
              <SketchfabEmbed modelId={modelId} autospin={autospin} />
            </div>
          )}
          {/* Overlay scuro per leggibilità */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `rgba(13,8,26,${overlayOpacity})` }}
          />
        </div>
      )}

      {/* Glass card — slide-up + fade dopo cardDelay */}
      <div
        className="relative z-10 max-w-4xl w-full flex flex-col items-start glass-card glass-border rounded-3xl p-8 md:p-12 transition-all duration-700 ease-out"
        style={{
          opacity: cardReady ? 1 : 0,
          transform: cardReady ? 'translateY(0)' : 'translateY(36px)',
          pointerEvents: cardReady ? 'auto' : 'none',
        }}
      >
        <h2
          className="text-4xl md:text-5xl font-instrument font-bold text-white mb-8 uppercase tracking-widest"
          data-text={title}
        >
          {title}
        </h2>
        <div className="text-white/80 font-inter text-lg leading-relaxed w-full">
          {children}
        </div>
      </div>
    </section>
  );
}

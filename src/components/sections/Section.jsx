import { useState, useEffect, useRef } from 'react';
import SketchfabEmbed from '../SketchfabEmbed';

export default function Section({
  id,
  title,
  children,
  modelId,
  autospin = 0,
  overlayOpacity = 0.5,
  cardDelay = 2200,
  topMask = 68,
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

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setCardReady(true), cardDelay);
    return () => clearTimeout(t);
  }, [visible, cardDelay]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden
                 px-4 md:px-24
                 py-20 md:py-24"
    >
      {/* 3D background */}
      {modelId && (
        <div className="absolute inset-0 w-full h-full">
          {visible && (
            <div className="w-full h-full transition-all duration-1000 ease-out">
              <SketchfabEmbed modelId={modelId} autospin={autospin} topMask={topMask} />
            </div>
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `rgba(13,8,26,${overlayOpacity})` }}
          />
        </div>
      )}

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-2xl md:max-w-4xl flex flex-col items-start
                   glass-card glass-border rounded-2xl md:rounded-3xl
                   p-6 md:p-12
                   transition-all duration-700 ease-out"
        style={{
          opacity: cardReady ? 1 : 0,
          transform: cardReady ? 'translateY(0)' : 'translateY(36px)',
          pointerEvents: cardReady ? 'auto' : 'none',
        }}
      >
        <h2 className="text-3xl md:text-5xl font-instrument font-bold text-white mb-6 md:mb-8 uppercase tracking-widest">
          {title}
        </h2>
        <div className="text-white/80 font-inter text-base md:text-lg leading-relaxed w-full">
          {children}
        </div>
      </div>
    </section>
  );
}

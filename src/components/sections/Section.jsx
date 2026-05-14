import { useState, useEffect, useRef } from 'react';
import Model3D from '../Model3D';

export default function Section({
  id,
  title,
  children,
  modelPath,
  modelScale = 1,
  modelPosition = [0, 0, 0],
  modelRotation = [0, 0, 0],
  cameraPosition = [0, 0, 5],
  cameraTarget = [0, 0, 0],
  startZ = 20,
  ambientIntensity = 1.5,
  environmentPreset = 'night',
  overlayOpacity = 0.5,
}) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);    // section entered viewport
  const [cardReady, setCardReady] = useState(false); // camera finished → show card

  // Observe when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center px-8 md:px-24 py-24 overflow-hidden"
    >
      {/* 3D background — only mounts when section is visible */}
      {modelPath && (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {visible && (
            <Model3D
              path={modelPath}
              scale={modelScale}
              position={modelPosition}
              rotation={modelRotation}
              cameraPosition={cameraPosition}
              cameraTarget={cameraTarget}
              startZ={startZ}
              ambientIntensity={ambientIntensity}
              environmentPreset={environmentPreset}
              onCameraArrived={() => setCardReady(true)}
              style={{ width: '100%', height: '100%' }}
            />
          )}
          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{ background: `rgba(13,8,26,${overlayOpacity})` }}
          />
        </div>
      )}

      {/* Glass card — fades in + slides up after camera arrives */}
      <div
        className="relative z-10 max-w-4xl w-full flex flex-col items-start glass-card glass-border rounded-3xl p-8 md:p-12 transition-all duration-700"
        style={{
          opacity: cardReady ? 1 : 0,
          transform: cardReady ? 'translateY(0)' : 'translateY(32px)',
        }}
      >
        <h2
          className="text-4xl md:text-5xl font-instrument font-bold text-white mb-8 uppercase tracking-widest glitch-text"
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

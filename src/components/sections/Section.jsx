import Model3D from '../Model3D';

export default function Section({ id, title, children, modelPath, modelScale = 1, modelPosition = [0, 0, 0], cameraPosition = [0, 0, 5] }) {
  return (
    <section id={id} className="relative w-full min-h-screen flex flex-col justify-center items-center px-8 md:px-24 py-24 overflow-hidden">

      {/* Sfondo 3D */}
      {modelPath && (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <Model3D
            path={modelPath}
            scale={modelScale}
            position={modelPosition}
            cameraPosition={cameraPosition}
            autoRotate
            rotateSpeed={0.002}
            ambientIntensity={1.8}
            environmentPreset="night"
            style={{ width: '100%', height: '100%' }}
          />
          {/* Overlay scuro per leggibilità */}
          <div className="absolute inset-0 bg-[#0D081A]/55 pointer-events-none" />
        </div>
      )}

      {/* Contenuto glass card */}
      <div className="relative z-10 max-w-4xl w-full flex flex-col items-start glass-card glass-border rounded-3xl p-8 md:p-12">
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

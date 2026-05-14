import Model3D from './Model3D';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Left: testo */}
      <div className="relative z-10 flex flex-col items-start text-left px-8 md:px-24 w-full md:w-1/2">

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

        {/* Sottotitolo con gradiente verde → viola */}
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

      {/* Right: modello 3D */}
      <div className="absolute right-0 top-0 w-full md:w-[55%] h-full pointer-events-none">
        <Model3D
          path="/loading.glb"
          scale={2.2}
          position={[0, -0.5, 0]}
          autoRotate
          rotateSpeed={0.004}
          cameraPosition={[0, 0, 6]}
          ambientIntensity={2}
          environmentPreset="night"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </section>
  );
}

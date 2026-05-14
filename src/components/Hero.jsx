export default function Hero() {
  return (
    <section id="hero" className="relative z-10 w-full min-h-screen flex flex-col justify-center items-start px-8 md:px-24 pt-32">
      
      <div className="max-w-4xl flex flex-col items-start text-left">
        
        {/* Eyebrow */}
        <p className="font-inter font-semibold text-sm md:text-base uppercase tracking-[0.2em] mb-4 text-accent">
          Four Frequencies
        </p>

        {/* Headline with Animated Gradient and Glass Stroke */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl leading-[1.1] tracking-tight font-inter font-bold mb-6 uppercase glitch-text animated-gradient-text glass-text-stroke"
          data-text="ZERO DOWNTIME"
        >
          Zero <br />
          Downtime
        </h1>

        {/* Action Button */}
        <button className="relative group glass-card rounded-full px-8 py-4 font-bold text-white font-inter tracking-widest uppercase transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 rounded-full border border-glow/50 group-hover:border-glow transition-colors duration-300 shadow-[inset_0_0_20px_rgba(94,210,156,0.2)]" />
          <span className="relative z-10 text-sm">Get Started</span>
        </button>

      </div>

    </section>
  );
}

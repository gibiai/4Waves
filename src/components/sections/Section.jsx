export default function Section({ id, title, children }) {
  return (
    <section id={id} className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center px-8 md:px-24 py-24">
      <div className="max-w-4xl w-full flex flex-col items-start glass-card glass-border rounded-3xl p-8 md:p-12">
        <h2 
          className="text-4xl md:text-5xl font-instrument font-bold text-white mb-8 uppercase tracking-widest glitch-text"
          data-text={title}
        >
          {title}
        </h2>
        <div className="text-white/80 font-inter text-lg leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}

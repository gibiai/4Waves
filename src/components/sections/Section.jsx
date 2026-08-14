import { useReveal } from '../../hooks/useReveal';

/* Shared shell: numbered heading + reveal-on-scroll content */
export default function Section({ id, index, title, children, className = '' }) {
  const ref = useReveal();

  return (
    <section id={id} className={`relative w-full min-h-screen flex items-center px-6 md:px-24 py-24 ${className}`}>
      {/* scrim for readability over the scene */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/75 to-transparent" />
      <div ref={ref} className="reveal relative w-full max-w-5xl mx-auto">
        <div className="flex items-baseline gap-4 mb-8 md:mb-12">
          <span className="font-inter font-bold text-glow text-sm md:text-base tracking-[0.3em]">
            {index}
          </span>
          <h2
            className="font-inter font-extrabold uppercase text-4xl md:text-6xl tracking-tight glitch-text text-gradient"
            data-text={title}
          >
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

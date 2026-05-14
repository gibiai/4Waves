import Background from './components/Background';
import Header from './components/Header';
import Hero from './components/Hero';
import Section from './components/sections/Section';
import { useScrollGlitch } from './hooks/useScrollGlitch';

function App() {
  // Attiva l'effetto glitch allo scorrimento
  useScrollGlitch();

  return (
    <main className="relative min-h-screen selection:bg-accent selection:text-primary">
      {/* Sfondo Canvas Dinamico */}
      <Background />
      
      {/* Navigazione Float */}
      <Header />
      
      {/* Sezioni a Scorrimento */}
      <div className="relative z-10">
        <Hero />
        
        <Section id="projects" title="Projects">
          <p className="mb-4">
            Our portfolio spans multiple dimensions, leveraging frequency modulation to secure scalable architectures.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-white/60">
            <li>Quantum Data Processing</li>
            <li>Neural Node Balancing</li>
            <li>Synthetic Wave Relays</li>
          </ul>
        </Section>
        
        <Section id="about" title="About 4Waves">
          <p>
            Born from the intersection of sound engineering and cloud architecture, 4WAVES delivers zero-downtime solutions by mimicking the natural harmonic frequencies of data flow. We don't just host servers, we orchestrate them.
          </p>
        </Section>
        
        <Section id="contact" title="Contact Us">
          <p className="mb-6">
            Ready to synchronize your infrastructure? Reach out to our frequency engineers.
          </p>
          <form className="flex flex-col gap-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="YOUR EMAIL" className="bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors" />
            <textarea placeholder="MESSAGE" rows="4" className="bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors"></textarea>
            <button className="bg-glow/20 border border-glow text-glow font-bold font-instrument tracking-widest py-3 rounded-md hover:bg-glow hover:text-primary transition-colors uppercase">
              Transmit
            </button>
          </form>
        </Section>

        <footer className="w-full py-12 text-center text-white/30 font-instrument text-sm">
          © 2026 4WAVES. ALL FREQUENCIES RESERVED.
        </footer>
      </div>
    </main>
  );
}

export default App;

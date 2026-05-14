import { useState } from 'react';
import Background from './components/Background';
import Header from './components/Header';
import Hero from './components/Hero';
import Section from './components/sections/Section';
import { useScrollGlitch } from './hooks/useScrollGlitch';

function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/xdkoeqwp', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="flex flex-col gap-4 max-w-md w-full" onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="YOUR NAME"
        required
        className="bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors"
      />
      <input
        type="email"
        name="email"
        placeholder="YOUR EMAIL"
        required
        className="bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors"
      />
      <textarea
        name="message"
        placeholder="MESSAGE"
        rows="4"
        required
        className="bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors resize-none"
      />
      {/* Hidden field to route to correct email */}
      <input type="hidden" name="_replyto" value="4waves.company@proton.me" />

      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="bg-glow/20 border border-glow text-glow font-bold font-instrument tracking-widest py-3 rounded-md hover:bg-glow hover:text-primary transition-colors uppercase disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message Sent ✓' : 'Transmit'}
      </button>

      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">Something went wrong. Try again.</p>
      )}
    </form>
  );
}

function App() {
  useScrollGlitch();

  return (
    <main className="relative min-h-screen selection:bg-accent selection:text-primary">
      <Background />
      <Header />

      <div className="relative z-10">
        <Hero />

        {/* Projects — camera bassa rasente la superficie, zoom da lontano */}
        <Section
          id="projects"
          title="Projects"
          modelPath="/abstract_red_background.glb"
          modelScale={3}
          modelPosition={[0, -0.5, 0]}
          cameraPosition={[0, 0.4, 3.5]}
          cameraTarget={[0, -0.8, 0]}
          startZ={22}
          cameraSpeed={0.3}
          ambientIntensity={1.2}
          environmentPreset="night"
          overlayOpacity={0.35}
        >
          <p className="mb-4 text-white/70">Here&apos;s all our projects launched:</p>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-glow inline-block" />
              Project 1
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-glow inline-block" />
              Project 2
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-glow inline-block" />
              Project 3
            </li>
          </ul>
        </Section>

        {/* About — camera lontana, si vede quasi tutto il modello */}
        <Section
          id="about"
          title="About 4Waves"
          modelPath="/shades_of_light.glb"
          modelScale={1.5}
          modelPosition={[0, 0, 0]}
          cameraPosition={[0, 0.5, 11]}
          cameraTarget={[0, 0, 0]}
          startZ={28}
          cameraSpeed={0.28}
          ambientIntensity={2}
          environmentPreset="night"
          overlayOpacity={0.45}
        >
          <p>
            Born from the intersection of sound engineering and cloud architecture, 4WAVES delivers
            zero-downtime solutions by mimicking the natural harmonic frequencies of data flow. We
            don&apos;t just host servers, we orchestrate them.
          </p>
        </Section>

        {/* Contact — paradox: camera leggermente alta, diagonale */}
        <Section
          id="contact"
          title="Contact Us"
          modelPath="/paradox_abstract_art_of_python.glb"
          modelScale={1.5}
          modelPosition={[0, 0, 0]}
          modelRotation={[0, Math.PI / 4, 0]}
          cameraPosition={[2, 1.8, 6]}
          cameraTarget={[0, 0, 0]}
          startZ={20}
          cameraSpeed={0.32}
          ambientIntensity={1.5}
          environmentPreset="night"
          overlayOpacity={0.45}
        >
          <p className="mb-6 text-white/70">
            Ready to synchronize your infrastructure? Reach out to our frequency engineers.
          </p>
          <ContactForm />
        </Section>

        <footer className="w-full py-12 text-center text-white/30 font-instrument text-sm">
          © 2026 4WAVES. ALL FREQUENCIES RESERVED.
        </footer>
      </div>
    </main>
  );
}

export default App;

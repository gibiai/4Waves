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
      const res = await fetch('https://formspree.io/f/mvzljqjk', {
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

      <div className="relative z-10 flex flex-col gap-16 md:gap-24">
        <Hero />

        <Section
          id="projects"
          title="Projects"
          modelId="c8e13126e1d04d3e83de457233fdcf2a"
          overlayOpacity={0.38}
          cardDelay={2000}
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

        <Section
          id="about"
          title="About 4Waves"
          modelId="2644f804dfcb434b8e7bde3e73ebc972"
          overlayOpacity={0.45}
          cardDelay={2200}
          topMask={90}
        >
          <p>
            Born from the intersection of sound engineering and cloud architecture, 4WAVES delivers
            zero-downtime solutions by mimicking the natural harmonic frequencies of data flow. We
            don&apos;t just host servers, we orchestrate them.
          </p>
        </Section>

        <Section
          id="contact"
          title="Contact Us"
          modelId="a9f0368eb94c475baae30579b704eed8"
          overlayOpacity={0.42}
          cardDelay={2000}
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

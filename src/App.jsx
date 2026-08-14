import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import CanvasScene from './components/CanvasScene';
import Header from './components/Header';
import Hero from './components/Hero';
import Section from './components/sections/Section';
import { useReveal } from './hooks/useReveal';
import { useScrollGlitch } from './hooks/useScrollGlitch';

/* ---------- side ticker: tiny vertical marquee hugging the right edge ---------- */
const TICKER_WORDS = ['AMPLITUDE', 'FREQUENCY', 'WAVELENGTH', 'PHASE'];

function SideTicker({ side = 'right' }) {
  const column = [...TICKER_WORDS, ...TICKER_WORDS];
  const pos = side === 'right' ? 'right-1.5 md:right-3' : 'left-1.5 md:left-3';
  return (
    <div className={`marquee-v-mask fixed ${pos} inset-y-0 z-30 pointer-events-none hidden sm:flex overflow-hidden`}>
      <div className={`marquee-v-track ${side === 'right' ? 'marquee-v-track-rev' : ''} flex flex-col items-center gap-10 font-inter font-semibold uppercase text-[9px] tracking-[0.45em] text-white/30`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-col items-center gap-10 shrink-0" aria-hidden={copy === 1}>
            {column.map((w, i) => (
              <span key={i} style={{ writingMode: 'vertical-rl' }}>
                {w}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- manifesto: big statement between hero and projects ---------- */
function Manifesto() {
  const ref = useReveal();
  return (
    <section className="relative w-full flex items-center px-6 md:px-24 py-24 md:py-40">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/55 to-transparent" />
      <div ref={ref} className="reveal relative w-full max-w-5xl mx-auto text-center">
        <p className="font-inter font-extrabold uppercase leading-tight">
          <span className="block text-xl md:text-3xl text-white/40 tracking-widest">Most services</span>
          <span className="block text-3xl md:text-6xl animated-gradient-text my-2">ride the wave.</span>
          <span className="block text-xl md:text-3xl text-white/40 tracking-widest">Ours</span>
          <span className="block text-4xl md:text-7xl text-glow glow-mint glitch-text" data-text="GENERATE IT.">
            generate it.
          </span>
        </p>
        <p className="mt-8 md:mt-10 max-w-2xl mx-auto text-sm md:text-base text-white/55 leading-relaxed font-inter">
          Design, code, cloud and sound: four dimensions of engineering, phase-locked into one
          carrier wave. Where others measure output in features, we measure it in{' '}
          <span className="text-glow">resonance</span>: signal so clean it cuts through any noise floor.
        </p>
      </div>
    </section>
  );
}

/* ---------- projects ---------- */
const PROJECTS = [
  {
    num: '01',
    title: 'Project One',
    desc: 'A placeholder transmission. Swap in your first launched project here.',
    meta: 'FREQ // 432Hz · PHASE // α',
  },
  {
    num: '02',
    title: 'Project Two',
    desc: 'A placeholder transmission. Swap in your second launched project here.',
    meta: 'FREQ // 528Hz · PHASE // β',
  },
  {
    num: '03',
    title: 'Project Three',
    desc: 'A placeholder transmission. Swap in your third launched project here.',
    meta: 'FREQ // 963Hz · PHASE // γ',
  },
];

function Projects() {
  return (
    <Section id="projects" index="01" title="Projects">
      <p className="mb-10 text-white/60 max-w-xl">
        Every launch is a waveform: engineered, amplified, released into orbit.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {PROJECTS.map((p) => (
          <article
            key={p.num}
            className="group glass-card glass-border rounded-2xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(94,210,156,0.15)] cursor-pointer"
          >
            <span className="font-inter font-bold text-5xl text-white/10 group-hover:text-glow/40 transition-colors">
              {p.num}
            </span>
            <h3 className="mt-4 font-inter font-bold uppercase tracking-wider text-lg text-white group-hover:text-glow transition-colors">
              {p.title}
            </h3>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">{p.desc}</p>
            <p className="mt-6 font-inter text-[10px] tracking-[0.25em] text-white/30 uppercase">
              {p.meta}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ---------- about ---------- */
const STATS = [
  ['4', 'Dimensions'],
  ['∞', 'Amplitude'],
  ['0', 'Downtime'],
  ['1', 'Signal'],
];

function About() {
  return (
    <Section id="about" index="02" title="About 4Waves">
      <div className="max-w-2xl">
        <p className="text-white/70 text-base md:text-lg leading-relaxed">
          Born at the intersection of sound engineering and cloud architecture,{' '}
          <span className="text-white font-semibold">4WAVES</span> builds systems that behave like
          waves: adaptive in amplitude, precise in frequency, immune to interference. We don&apos;t
          just ship software, we <span className="text-glow">orchestrate it</span>, tuning every
          layer of the stack until it resonates at the natural frequency of your business.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(([value, label]) => (
          <div
            key={label}
            className="glass-card glass-border rounded-2xl p-6 text-center hover:shadow-[0_0_30px_rgba(177,78,255,0.12)] transition-shadow"
          >
            <span className="block font-inter font-extrabold text-4xl md:text-5xl animated-gradient-text">
              {value}
            </span>
            <span className="mt-2 block font-inter text-[11px] tracking-[0.3em] uppercase text-white/40">
              {label}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- contact ---------- */
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

  const inputClass =
    'bg-white/5 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:border-glow font-inter transition-colors';

  return (
    <form className="flex flex-col gap-4 max-w-md w-full" onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="YOUR NAME" required className={inputClass} />
      <input type="email" name="email" placeholder="YOUR EMAIL" required className={inputClass} />
      <textarea
        name="message"
        placeholder="MESSAGE"
        rows="4"
        required
        className={`${inputClass} resize-none`}
      />
      <input type="hidden" name="_replyto" value="4waves.company@proton.me" />

      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="bg-glow/20 border border-glow text-glow font-bold font-inter tracking-widest py-3 rounded-md hover:bg-glow hover:text-primary transition-colors uppercase disabled:opacity-50 cursor-pointer"
      >
        {status === 'sending' ? 'Transmitting...' : status === 'sent' ? 'Signal received ✓' : 'Transmit'}
      </button>

      {status === 'error' && (
        <p className="text-red-400 text-sm text-center">Interference detected. Try again.</p>
      )}
    </form>
  );
}

function Contact() {
  return (
    <Section id="contact" index="03" title="Contact Us">
      <p className="mb-8 text-white/60 max-w-xl">
        Ready to synchronize? Open a channel: our frequency engineers are always listening.
      </p>
      <ContactForm />
    </Section>
  );
}

/* ---------- app ---------- */
function App() {
  useScrollGlitch();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.05 });
    window.__lenis = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return (
    <main className="relative min-h-screen selection:bg-accent selection:text-primary">
      <CanvasScene />
      <Header />
      <SideTicker side="left" />
      <SideTicker side="right" />

      <div className="relative z-10">
        <Hero />
        <Manifesto />
        <Projects />
        <About />
        <Contact />

        <footer className="w-full py-12 text-center text-white/30 font-inter text-xs tracking-[0.3em] uppercase">
          © 2026 4WAVES · All frequencies reserved.
        </footer>
      </div>
    </main>
  );
}

export default App;

import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const links = ['PROJECTS', 'ABOUT', 'CONTACT'];

  const scrollToSection = (id) => {
    const element = document.getElementById(id.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-center mt-6 px-4">
      <header className="w-full max-w-5xl glass-card glass-border rounded-full py-4 px-6 md:px-10 flex justify-between items-center transition-all duration-300">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative text-white font-bold text-xl tracking-wider font-instrument"
        >
          <img
            src="/waves1-bg.png"
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              mixBlendMode: 'screen',
              opacity: 0.85,
              width: '520px',
              height: '160px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              objectFit: 'contain',
            }}
          />
          <span className="relative z-10">4WAVES</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-instrument">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => scrollToSection(link)}
              className="text-sm font-bold text-white/80 hover:text-white px-2 py-1 transition-all duration-300 uppercase tracking-wide cursor-pointer relative group"
            >
              <span className="relative z-10">{link}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-glow transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(94,210,156,0.8)]"></span>
            </button>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white z-50 relative" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-primary/95 backdrop-blur-xl flex flex-col justify-center items-center gap-8 z-40 font-instrument">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => scrollToSection(link)}
              className="text-3xl font-bold text-white hover:text-glow transition-colors uppercase tracking-widest"
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

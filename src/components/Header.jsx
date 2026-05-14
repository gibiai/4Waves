import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const links = [
    { label: 'Projects', id: 'projects' },
    { label: 'About', id: 'about' },
    { label: 'Contact Us', id: 'contact' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-16 pt-8">
      {/* Logo */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-white font-bold text-xl tracking-wider font-instrument"
      >
        4WAVES
      </button>

      {/* Desktop Nav */}
      <nav className="hidden md:flex gap-10 items-center font-instrument">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-widest cursor-pointer relative group"
          >
            {link.label}
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-glow transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
      </nav>

      {/* Mobile Toggle */}
      <button
        className="md:hidden text-white z-50 relative"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-primary/95 backdrop-blur-xl flex flex-col justify-center items-center gap-10 z-40 font-instrument">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-3xl font-bold text-white hover:text-glow transition-colors uppercase tracking-widest"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

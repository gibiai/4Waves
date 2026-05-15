export default function Header() {
  const links = [
    { label: 'Projects', id: 'projects' },
    { label: 'About', id: 'about' },
    { label: 'Contact Us', id: 'contact' },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center gap-2 landscape:gap-2 px-3 landscape:px-4 md:px-16 pt-3 landscape:pt-2 md:pt-8">
      {/* Logo immagine */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center shrink-0"
        aria-label="Torna all'inizio"
      >
        <img
          src="/logo.png"
          alt="4 WAVES"
          className="h-14 landscape:h-9 md:h-24 w-auto object-contain rounded-xl landscape:rounded-lg md:rounded-2xl border border-white/20 transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_12px_rgba(94,210,156,0.3)]"
          style={{ mixBlendMode: 'screen' }}
        />
      </button>

      {/* Nav — tutti i link in un unico bottone bordato */}
      <nav className="flex items-center gap-3 landscape:gap-3 md:gap-8 px-3 landscape:px-3 md:px-8 py-2 landscape:py-1.5 md:py-3 rounded-xl landscape:rounded-lg md:rounded-2xl border border-white/20 transition-all duration-300 hover:border-white/50 hover:shadow-[0_0_12px_rgba(94,210,156,0.3)] font-instrument shrink-0">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="text-[10px] landscape:text-[10px] md:text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-wider md:tracking-widest cursor-pointer relative group"
          >
            {link.label}
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-glow transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
      </nav>
    </div>
  );
}

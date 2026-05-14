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
    <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-16 pt-6 md:pt-8">
      {/* Logo immagine */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center"
        aria-label="Torna all'inizio"
      >
        <img
          src="/logo.png"
          alt="4 WAVES"
          className="h-10 md:h-12 w-auto object-contain"
          style={{ mixBlendMode: 'screen' }}
        />
      </button>

      {/* Nav — sempre visibile, si riduce su mobile */}
      <nav className="flex gap-5 md:gap-10 items-center font-instrument">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="text-xs md:text-sm font-bold text-white/70 hover:text-white transition-colors duration-300 uppercase tracking-widest cursor-pointer relative group"
          >
            {link.label}
            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-glow transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
      </nav>
    </div>
  );
}

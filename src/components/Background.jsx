import { useEffect, useRef } from 'react';

const SpiderWebCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };
    window.addEventListener('resize', resize);

    // 3-4 hub grandi + molti punti satellite attorno
    const HUB_COUNT = 4;
    const SATELLITE_COUNT = 24;
    const CONNECTION_DIST = 190;
    const hubColors = ['#5ED29C', '#FF6B35', '#9D4EDD', '#FFFFFF'];
    let nodes = [];

    function initParticles() {
      nodes = [];

      // Hub: nodi grandi e luminosi (uno per quadrante)
      const quadrants = [
        { x: width * 0.25, y: height * 0.35 },
        { x: width * 0.72, y: height * 0.28 },
        { x: width * 0.18, y: height * 0.72 },
        { x: width * 0.68, y: height * 0.70 },
      ];

      for (let i = 0; i < HUB_COUNT; i++) {
        const q = quadrants[i];
        nodes.push({
          x: q.x + (Math.random() - 0.5) * 60,
          y: q.y + (Math.random() - 0.5) * 60,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.05,
          color: hubColors[i],
          size: Math.random() * 2.5 + 3.5,
          phaseOffset: Math.random() * Math.PI * 2,
          opacity: 0.95,
          isHub: true,
          hubIndex: i,
        });
      }

      // Satelliti: piccoli, densamente distribuiti attorno agli hub
      for (let i = 0; i < SATELLITE_COUNT; i++) {
        const hub = quadrants[Math.floor(Math.random() * HUB_COUNT)];
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 180 + 30;
        nodes.push({
          x: Math.min(Math.max(hub.x + Math.cos(angle) * radius, 0), width),
          y: Math.min(Math.max(hub.y + Math.sin(angle) * radius, 0), height),
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.07,
          color: hubColors[Math.floor(Math.random() * hubColors.length)],
          size: Math.random() * 1.2 + 0.6,
          phaseOffset: Math.random() * Math.PI * 2,
          opacity: Math.random() * 0.35 + 0.45,
          isHub: false,
          hubIndex: Math.floor(Math.random() * HUB_COUNT),
        });
      }
    }

    initParticles();
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Aggiorna posizioni
      nodes.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.y += Math.sin(time * 0.5 + p.phaseOffset) * 0.12;

        // Hub: alone intenso; satelliti: puntino sottile
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.isHub ? 28 : 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      // Connessioni — hub-to-hub più spesse, satellite più sottili
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);

          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST);
            const hubBoost = (a.isHub && b.isHub) ? 1.0 : (a.isHub || b.isHub) ? 0.75 : 0.45;
            const finalAlpha = alpha * ((a.opacity + b.opacity) / 2) * hubBoost;

            ctx.lineWidth = (a.isHub && b.isHub) ? 1.2 : 0.55;

            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.color);
            grad.addColorStop(1, b.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = finalAlpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      time += 0.01;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-[#0D081A] overflow-hidden">
      {/* Spline 3D Scene */}
      <iframe
        src="https://my.spline.design/claritystream-qOBXG7FiiXtbAR9NvhkX3GNT/"
        frameBorder="0"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', border: 'none' }}
        title="Spline 3D Background"
        allow="autoplay"
      />

      {/* Copre watermark "Built with Spline" — gradiente sfumato, invisibile */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '320px',
          height: '80px',
          background: 'linear-gradient(to top left, #0D081A 30%, transparent 100%)',
          zIndex: 10,
        }}
      />

      {/* Spider Web Canvas */}
      <SpiderWebCanvas />

      {/* Overlay scuro sinistra per leggibilità testo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0D081A]/70 via-[#0D081A]/10 to-transparent pointer-events-none" />
    </div>
  );
}

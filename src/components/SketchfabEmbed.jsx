import { useRef, useState } from 'react';

const bg = '#0D081A';

export default function SketchfabEmbed({
  modelId,
  autospin = 0,
  revealDelay = 1700,
  topMask = 68,       // altezza maschera top in px (aumenta per coprire autore)
  className = '',
  style = {},
}) {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef(null);

  const handleLoad = () => {
    timerRef.current = setTimeout(() => setRevealed(true), revealDelay);
  };

  const params = new URLSearchParams({
    autostart:      '1',
    preload:        '1',
    autospin:       String(autospin),
    ui_controls:    '0',
    ui_infos:       '0',
    ui_stop:        '0',
    ui_watermark:   '0',
    ui_hint:        '0',
    ui_ar:          '0',
    ui_vr:          '0',
    ui_fullscreen:  '0',
    ui_animations:  '0',
    ui_inspector:   '0',
    ui_settings:    '0',
    ui_loading:     '0',
    ui_annotations: '0',
    ui_color:       '000000',
  });

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>

      {/* iframe — pointer-events none */}
      <iframe
        title="3D Model"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${modelId}/embed?${params}`}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none', pointerEvents: 'none' }}
        onLoad={handleLoad}
      />

      {/* Loading overlay — scompare dopo revealDelay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ background: bg, zIndex: 30, opacity: revealed ? 0 : 1 }}
      />

      {/* TOP — copre autore/titolo (altezza configurabile via topMask) */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: `${topMask + 20}px`, zIndex: 25, background: `linear-gradient(to bottom, ${bg} 65%, transparent)` }} />
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: `${topMask}px`, zIndex: 26, background: bg }} />

      {/* BOTTOM — striscia solida full-width */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '120px', zIndex: 25, background: `linear-gradient(to top, ${bg} 70%, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '70px', zIndex: 26, background: bg }} />


      {/* Overlay blocca-tutto — pan-y permette scroll pagina */}
      <div className="absolute inset-0"
        style={{ zIndex: 31, pointerEvents: 'all', cursor: 'default', touchAction: 'pan-y' }} />
    </div>
  );
}

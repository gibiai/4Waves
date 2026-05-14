/**
 * SketchfabEmbed — iframe decorativo puro.
 * La UI di Sketchfab (autore, barra animazione, logo, controlli) viene
 * coperta fisicamente da div gradient posizionati sopra l'iframe,
 * poiché l'iframe è cross-origin e i parametri ui_*=0 non bastano.
 */
export default function SketchfabEmbed({ modelId, autospin = 0, className = '', style = {} }) {
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

  const bg = '#0D081A';

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>

      {/* iframe: pointer-events none → mouse non raggiunge mai Sketchfab */}
      <iframe
        title="3D Model"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${modelId}/embed?${params}`}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none', pointerEvents: 'none' }}
      />

      {/* ── Maschere che coprono la UI di Sketchfab ──────────────── */}

      {/* TOP — copre "Nome modello / by autore" + icone download/share */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: '64px', zIndex: 20, background: `linear-gradient(to bottom, ${bg} 55%, transparent)` }} />

      {/* BOTTOM — copre barra animazione, timer, cerchio blu, controlli */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '80px', zIndex: 20, background: `linear-gradient(to top, ${bg} 60%, transparent)` }} />

      {/* BOTTOM-LEFT solido — copre il logo Sketchfab (cerchio blu+cubo) */}
      <div className="absolute bottom-0 left-0 pointer-events-none" style={{ width: '80px', height: '80px', zIndex: 21, background: bg }} />

      {/* BOTTOM-RIGHT solido — copre i bottoni ?, settings, VR, fullscreen */}
      <div className="absolute bottom-0 right-0 pointer-events-none" style={{ width: '200px', height: '80px', zIndex: 21, background: `linear-gradient(to left, ${bg} 50%, transparent)` }} />

      {/* Overlay trasparente: blocca tutti gli eventi mouse sull'intera area */}
      <div className="absolute inset-0" style={{ zIndex: 22, pointerEvents: 'all', cursor: 'default' }} />

    </div>
  );
}

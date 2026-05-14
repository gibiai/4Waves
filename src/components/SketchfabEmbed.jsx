/**
 * SketchfabEmbed — iframe solo decorativo, nessuna UI, nessuna interazione mouse.
 * Il div overlay trasparente sopra l'iframe blocca tutti gli eventi mouse,
 * impedendo che appaiano controlli, info autore, barra animazione ecc.
 */
export default function SketchfabEmbed({ modelId, autospin = 0, className = '', style = {} }) {
  const params = new URLSearchParams({
    autostart: '1',
    preload: '1',
    autospin: String(autospin),
    // Nasconde TUTTA la UI Sketchfab
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
    <div className={`relative w-full h-full ${className}`} style={style}>
      {/* pointer-events: none sull'iframe → mouse non ci arriva mai */}
      <iframe
        title="3D Model"
        frameBorder="0"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${modelId}/embed?${params}`}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none', pointerEvents: 'none' }}
      />
      {/* Overlay trasparente: secondo livello di blocco eventi mouse */}
      <div className="absolute inset-0" style={{ zIndex: 5, pointerEvents: 'all', cursor: 'default' }} />
    </div>
  );
}

/**
 * SketchfabEmbed — iframe wrapper con autostart, UI pulita, cover watermark
 * interactive=true → l'utente può ruotare con il mouse
 */
export default function SketchfabEmbed({ modelId, autospin = 0, className = '', style = {} }) {
  const params = new URLSearchParams({
    autostart: '1',
    preload: '1',
    ui_controls: '0',
    ui_infos: '0',
    ui_stop: '0',
    ui_watermark: '0',
    ui_hint: '0',
    ui_ar: '0',
    ui_vr: '0',
    ui_fullscreen: '0',
    camera: '0',           // permette interazione mouse
    autospin: String(autospin),
  });

  return (
    <div className={`relative w-full h-full ${className}`} style={style}>
      <iframe
        title="3D Model"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={`https://sketchfab.com/models/${modelId}/embed?${params}`}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none' }}
      />
      {/* Copre il logo Sketchfab in basso a sinistra */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '160px',
          height: '38px',
          background: 'linear-gradient(to top right, #0D081A 40%, transparent 100%)',
          zIndex: 10,
        }}
      />
    </div>
  );
}

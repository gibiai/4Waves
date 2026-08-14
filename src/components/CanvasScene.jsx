import { useEffect, useRef } from 'react';
import SceneManager from '../three/SceneManager';

export default function CanvasScene() {
  const canvasRef = useRef(null);
  const managerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || managerRef.current) return;
    managerRef.current = new SceneManager(canvasRef.current);
    // expose burst so UI events (nav clicks) can trigger a glitch
    window.__fourwavesBurst = (s) => managerRef.current?.burst(s);
    window.__fourwavesScene = managerRef.current;
    return () => {
      managerRef.current?.dispose();
      managerRef.current = null;
      delete window.__fourwavesBurst;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

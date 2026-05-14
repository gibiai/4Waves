import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ── Easing ─────────────────────────────────────────────── */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ── Camera zoom-in animator ─────────────────────────────── */
function CameraAnimator({ targetPos, targetLookAt, startZ, speed = 0.45, onArrived }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const arrived = useRef(false);
  const startPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1], startZ));
  const endPos = useRef(new THREE.Vector3(...targetPos));
  const lookAt = useRef(new THREE.Vector3(...targetLookAt));

  // set camera to start position immediately
  useFrame(() => {
    if (arrived.current) return;
    progress.current = Math.min(1, progress.current + 0.016 * speed);
    const t = easeOutCubic(progress.current);
    camera.position.lerpVectors(startPos.current, endPos.current, t);
    camera.lookAt(lookAt.current);
    if (progress.current >= 0.85 && !arrived.current) {
      arrived.current = true;
      onArrived?.();
    }
  });

  return null;
}

/* ── GLB model with optional white-material override ────── */
function GLBModel({ path, scale, position, rotation, white, autoSpin, spinSpeed }) {
  const { scene } = useGLTF(path);
  const ref = useRef();
  const cloned = useRef(scene.clone(true));

  // white override: traverse all meshes and set material color to white
  if (white) {
    cloned.current.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color('#ffffff');
        child.material.emissive = new THREE.Color('#aaaaaa');
        child.material.emissiveIntensity = 0.4;
      }
    });
  }

  useFrame(() => {
    if (autoSpin && ref.current) ref.current.rotation.y += spinSpeed ?? 0.003;
  });

  return (
    <primitive
      ref={ref}
      object={cloned.current}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

/* ── Main export ─────────────────────────────────────────── */
export default function Model3D({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoSpin = false,
  spinSpeed = 0.003,
  white = false,
  style = {},
  // camera
  cameraPosition = [0, 0, 5],
  cameraTarget = [0, 0, 0],
  startZ = null,                  // if set → zoom-in animation from this Z
  cameraSpeed = 0.45,
  // callbacks
  onCameraArrived = null,
  // lighting
  ambientIntensity = 1.5,
  environmentPreset = 'city',
}) {
  const animateCamera = startZ !== null;

  return (
    <Canvas
      style={style}
      camera={{ position: animateCamera ? [cameraPosition[0], cameraPosition[1], startZ] : cameraPosition, fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, 5]} intensity={0.6} />

      <Suspense fallback={null}>
        <GLBModel
          path={path}
          scale={scale}
          position={position}
          rotation={rotation}
          white={white}
          autoSpin={autoSpin}
          spinSpeed={spinSpeed}
        />
        <Environment preset={environmentPreset} />
      </Suspense>

      {animateCamera && (
        <CameraAnimator
          targetPos={cameraPosition}
          targetLookAt={cameraTarget}
          startZ={startZ}
          speed={cameraSpeed}
          onArrived={onCameraArrived}
        />
      )}
    </Canvas>
  );
}

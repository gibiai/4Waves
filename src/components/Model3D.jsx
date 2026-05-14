import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

function GLBModel({ path, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], autoRotate = false, rotateSpeed = 0.003 }) {
  const { scene } = useGLTF(path);
  const ref = useRef();

  useFrame(() => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += rotateSpeed;
    }
  });

  return <primitive ref={ref} object={scene} scale={scale} position={position} rotation={rotation} />;
}

export default function Model3D({
  path,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  rotateSpeed = 0.003,
  className = '',
  style = {},
  cameraPosition = [0, 0, 5],
  enableOrbit = false,
  ambientIntensity = 1.5,
  environmentPreset = 'city',
}) {
  return (
    <Canvas
      className={className}
      style={style}
      camera={{ position: cameraPosition, fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        <GLBModel
          path={path}
          scale={scale}
          position={position}
          rotation={rotation}
          autoRotate={autoRotate}
          rotateSpeed={rotateSpeed}
        />
        <Environment preset={environmentPreset} />
      </Suspense>
      {enableOrbit && <OrbitControls enableZoom={false} />}
    </Canvas>
  );
}

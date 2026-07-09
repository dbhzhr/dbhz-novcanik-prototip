// 3D prikaz biste — lazy chunk (three.js + R3F učitavaju se tek kad se otvori ekran Bista).
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows, useGLTF } from '@react-three/drei';
import { Suspense, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { bistaCampaign } from '../lib/mock';

const MODEL = bistaCampaign.model;

function Bust() {
  const { scene } = useGLTF(MODEL);
  useLayoutEffect(() => {
    // Brončani odljev — meshStandardMaterial (model dolazi bez materijala iz STL-a).
    scene.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#b07d44'),
          metalness: 0.78,
          roughness: 0.42,
        });
        mesh.castShadow = true;
        (mesh.geometry as THREE.BufferGeometry).computeVertexNormals();
      }
    });
  }, [scene]);
  return <primitive object={scene} />;
}

export default function BistaViewer() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 3.6], fov: 40 }}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#0c1c13']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#ffe6b0" />
      <Suspense fallback={null}>
        {/* Model je već Y-up (vertikala = najveći raspon) → bez rotacije stoji uspravno */}
        <Center>
          <Bust />
        </Center>
        <ContactShadows position={[0, -1.05, 0]} opacity={0.5} scale={7} blur={2.6} far={3} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        // Rotacija ZAKLJUČANA na vertikalnu os: polarni kut fiksan (min === max, 8° iznad
        // horizonta) → bista se vrti samo lijevo-desno, pogled se ne može okrenuti naglavačke.
        minPolarAngle={THREE.MathUtils.degToRad(82)}
        maxPolarAngle={THREE.MathUtils.degToRad(82)}
        autoRotate
        autoRotateSpeed={0.9}
        minDistance={2.2}
        maxDistance={6.5}
        enableDamping
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL);

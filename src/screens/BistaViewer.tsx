// 3D prikaz biste — lazy chunk (three.js + R3F učitavaju se tek kad se otvori ekran Bista).
//
// Rotacija je ZAKLJUČANA na vertikalnu os: polarni kut kamere fiksan (min === max)
// → bista se vrti samo lijevo-desno (360°), pogled se ne može okrenuti naglavačke.
// Model je geometrijski uspravljen u scripts/fix_upright.py (scan je bio nagnut 42.8°).
//
// Materijali: model nema teksture — jedan MeshStandardMaterial (boja + metalness +
// roughness). Prijelaz između varijanti se ANIMIRA lerpanjem sva tri parametra u
// render-petlji. Deep-link: ?screen=bista&materijal=kamen|patina|bronca.
// Standalone verzija komponente: github.com/stepanic/dbhz-bista-3d
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { bistaCampaign } from '../lib/mock';

const MODEL = bistaCampaign.model;

type BistaVariant = 'bronca' | 'kamen' | 'patina';

// Tri varijante odljeva: bronca · bijeli brački kamen · korodirana bronca (zelena patina)
const VARIANTS: Record<BistaVariant, { color: string; metalness: number; roughness: number }> = {
  bronca: { color: '#b07d44', metalness: 0.78, roughness: 0.42 },
  kamen: { color: '#e9e4d3', metalness: 0.02, roughness: 0.93 },
  patina: { color: '#5b9b82', metalness: 0.28, roughness: 0.74 },
};
const VARIANT_LABEL: Record<BistaVariant, string> = {
  bronca: 'Bronca',
  kamen: 'Brački kamen',
  patina: 'Bronca s patinom',
};
const VARIANT_ORDER: BistaVariant[] = ['bronca', 'kamen', 'patina'];

function variantFromUrl(): BistaVariant | null {
  const v = new URLSearchParams(window.location.search).get('materijal');
  return v && v in VARIANTS ? (v as BistaVariant) : null;
}

function Bust({ variant }: { variant: BistaVariant }) {
  const { scene } = useGLTF(MODEL);
  const material = useMemo(() => {
    const v = VARIANTS[variantFromUrl() ?? 'bronca'];
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(v.color),
      metalness: v.metalness,
      roughness: v.roughness,
    });
  }, []);
  useLayoutEffect(() => {
    scene.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = material;
        mesh.castShadow = true;
        (mesh.geometry as THREE.BufferGeometry).computeVertexNormals();
      }
    });
  }, [scene, material]);

  const targetColor = useMemo(() => new THREE.Color(VARIANTS[variant].color), [variant]);
  useFrame((_, dt) => {
    // Eksponencijalno prigušenje prema ciljnom materijalu (~1 s prijelaz), frame-rate neovisno.
    const k = 1 - Math.exp(-4.5 * dt);
    const t = VARIANTS[variant];
    material.color.lerp(targetColor, k);
    material.metalness += (t.metalness - material.metalness) * k;
    material.roughness += (t.roughness - material.roughness) * k;
  });
  return <primitive object={scene} />;
}

/** inline = u layoutu · native = Fullscreen API · overlay = CSS fallback (iOS bez API-ja).
 *  Overlay je position:fixed — na mobitelu OK (nema transformiranog phone framea),
 *  na desktopu se nikad ne koristi jer tamo postoji nativni Fullscreen API. */
type FsMode = 'inline' | 'native' | 'overlay';

export default function BistaViewer() {
  const [variant, setVariant] = useState<BistaVariant>(() => variantFromUrl() ?? 'bronca');
  const [fs, setFs] = useState<FsMode>('inline');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Izlaz iz nativnog fullscreena (Escape, gesta) mora sinkronizirati state.
    const onChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
        setFs((m) => (m === 'native' ? 'inline' : m));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFs((m) => (m === 'overlay' ? 'inline' : m));
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggleFullscreen = async () => {
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!el) return;
    if (fs === 'inline') {
      if (el.requestFullscreen) {
        try {
          await el.requestFullscreen();
          setFs('native');
          return;
        } catch {
          /* padamo na CSS overlay */
        }
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
        setFs('native');
        return;
      }
      setFs('overlay');
    } else if (fs === 'native') {
      const doc = document as Document & { webkitExitFullscreen?: () => void };
      (document.exitFullscreen ?? doc.webkitExitFullscreen)?.call(document);
      setFs('inline');
    } else {
      setFs('inline');
    }
  };

  const wrapStyle: React.CSSProperties =
    fs === 'overlay'
      ? { position: 'fixed', inset: 0, zIndex: 80, background: '#0c1c13' }
      : { position: 'relative', width: '100%', height: '100%', background: '#0c1c13' };

  return (
    <div ref={wrapRef} style={wrapStyle}>
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
          {/* Model je već Y-up i geometrijski uspravljen → bez rotacije stoji uspravno */}
          <Center>
            <Bust variant={variant} />
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

      {/* Izbor materijala — swatchevi (prijelaz je animiran u Bust/useFrame) */}
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
        {VARIANT_ORDER.map((v) => (
          <button
            key={v}
            type="button"
            title={VARIANT_LABEL[v]}
            aria-label={VARIANT_LABEL[v]}
            aria-pressed={variant === v}
            onClick={() => setVariant(v)}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: VARIANTS[v].color,
              cursor: 'pointer',
              border: variant === v ? '2px solid #fff' : '2px solid rgba(255,255,255,0.35)',
              boxShadow: variant === v ? '0 0 0 2px rgba(217,158,18,0.9)' : '0 1px 4px rgba(0,0,0,0.4)',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={toggleFullscreen}
        title={fs === 'inline' ? 'Puni zaslon' : 'Izađi iz punog zaslona'}
        aria-label={fs === 'inline' ? 'Puni zaslon' : 'Izađi iz punog zaslona'}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(6,39,22,0.55)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {fs === 'inline' ? (
            <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
          ) : (
            <path d="M8 3v5H3M21 8h-5V3M16 21v-5h5M3 16h5v5" />
          )}
        </svg>
      </button>
    </div>
  );
}

useGLTF.preload(MODEL);

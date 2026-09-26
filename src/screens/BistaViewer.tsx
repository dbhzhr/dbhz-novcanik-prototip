// 3D prikaz biste — lazy chunk (three.js + R3F učitavaju se tek kad se otvori ekran Bista).
//
// Rotacija je ZAKLJUČANA na vertikalnu os: polarni kut kamere fiksan (min === max)
// → bista se vrti samo lijevo-desno (360°), pogled se ne može okrenuti naglavačke.
// Model je geometrijski uspravljen u scripts/fix_upright.py (scan je bio nagnut 42.8°).
//
// Materijali: model nema teksture — jedan MeshStandardMaterial (boja + metalness +
// roughness). Prijelaz između varijanti se ANIMIRA lerpanjem sva tri parametra u
// render-petlji. Deep-link: ?screen=bista&materijal=kamen|patina|bronca (odabir se
// zrcali u URL, kao u katalogu dbhz-3d-modeli.domovina.ai).
//
// Inline (kartica unutar ekrana koji se scrolla): touch-action pan-y + bez zooma — vertikalni
// swipe scrolla stranicu, horizontalni vrti bistu, kotačić miša ne otima scroll. Zoom
// (kotačić/pinch) tek u punom zaslonu.
// Standalone verzija komponente: github.com/stepanic/dbhz-bista-3d
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { bistaCampaign } from '../lib/mock';

const MODEL = bistaCampaign.model;
const BG = '#0c1c13';

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

/** Zrcali odabrani materijal u adresu (dijeljiva poveznica); bronca je zadana → bez parametra. */
function variantToUrl(v: BistaVariant) {
  const url = new URL(window.location.href);
  if (v === 'bronca') url.searchParams.delete('materijal');
  else url.searchParams.set('materijal', v);
  window.history.replaceState(window.history.state, '', url);
}

/** Napomena uz donji rub scene — vidljiva i u punom zaslonu (atribucija nije potvrđena). */
const CAVEAT = 'Ilustrativna 3D digitalizacija · atribucija nepotvrđena';

/** drei OrbitControls na spajanju postavi touch-action: none na izvor događaja. Inline to
 *  vraćamo na pan-y (mora se mountati NAKON OrbitControls → efekt se izvrši poslije). */
function TouchAction({ value }: { value: string }) {
  const target = useThree((s) => s.events.connected) as HTMLElement | undefined;
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = target ?? gl.domElement;
    el.style.touchAction = value;
  }, [target, gl, value]);
  return null;
}

function Bust({ variant }: { variant: BistaVariant }) {
  const { scene } = useGLTF(MODEL, false, false);
  // KLON scene: useGLTF kešira jedan THREE.Object3D, a isti objekt ne može biti u
  // dva scene grapha istovremeno (inline canvas + fullscreen overlay canvas).
  const instance = useMemo(() => scene.clone(true), [scene]);
  const material = useMemo(() => {
    const v = VARIANTS[variantFromUrl() ?? 'bronca'];
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(v.color),
      metalness: v.metalness,
      roughness: v.roughness,
    });
  }, []);
  useLayoutEffect(() => {
    instance.traverse((o: THREE.Object3D) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = material;
        mesh.castShadow = true;
        (mesh.geometry as THREE.BufferGeometry).computeVertexNormals();
      }
    });
  }, [instance, material]);

  const targetColor = useMemo(() => new THREE.Color(VARIANTS[variant].color), [variant]);
  useFrame((_, dt) => {
    // Eksponencijalno prigušenje prema ciljnom materijalu (~1 s prijelaz), frame-rate neovisno.
    const k = 1 - Math.exp(-4.5 * dt);
    const t = VARIANTS[variant];
    material.color.lerp(targetColor, k);
    material.metalness += (t.metalness - material.metalness) * k;
    material.roughness += (t.roughness - material.roughness) * k;
  });
  return <primitive object={instance} />;
}

/** Responzivno kadriranje: na svaku promjenu veličine viewporta (fullscreen, rotacija
 *  ekrana) postavi udaljenost kamere tako da CIJELI model stane i po visini i po širini
 *  — u uskom portretu horizontalni FOV je uzak pa bi fiksna udaljenost rezala bistu.
 *  Smjer kamere (azimut + fiksni polarni kut) se ne dira, samo udaljenost. */
function FitCamera({ subjectRef }: { subjectRef: React.RefObject<THREE.Group> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useEffect(() => {
    const obj = subjectRef.current;
    if (!obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;
    const dims = box.getSize(new THREE.Vector3());
    const halfH = dims.y / 2;
    // Horizontalni CIRKUMRADIUS (pola dijagonale XZ) — bista se vrti, pa projicirana
    // širina na dijagonalnim azimutima doseže dijagonalu boxa, ne samo dims.x.
    const rXZ = Math.hypot(dims.x, dims.z) / 2;
    const vTan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const hTan = vTan * (size.width / size.height);
    // Širina: fit računan na NAJBLIŽOJ plohi modela (dist − rXZ), jer perspektiva
    // povećava bliže dijelove; visina: klasični fit + blaga kompenzacija dubine
    // (najviši dio — kruna — je blizu osi rotacije, ne na najbližoj plohi).
    const distW = rXZ * (1.2 / hTan + 1);
    const distV = (1.15 * halfH) / vTan + 0.35 * rXZ;
    camera.position.setLength(Math.max(distV, distW)); // target je ishodište → čuva azimut i polarni kut
    camera.updateProjectionMatrix();
  }, [size, camera, subjectRef]);
  return null;
}

/** Kompletna scena — vlastiti Canvas. Renderira se i inline (kartica) i u
 *  fullscreen overlay portalu (svaki ima svoj WebGL kontekst i FitCamera). */
function SceneCanvas({ variant, interactive }: { variant: BistaVariant; interactive: boolean }) {
  const bustRef = useRef<THREE.Group>(null);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.2, 3.6], fov: 40 }}
      style={{ touchAction: interactive ? 'none' : 'pan-y' }}
    >
      <color attach="background" args={[BG]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} castShadow />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#ffe6b0" />
      <Suspense fallback={null}>
        {/* Model je već Y-up i geometrijski uspravljen → bez rotacije stoji uspravno */}
        <group ref={bustRef}>
          <Center>
            <Bust variant={variant} />
          </Center>
        </group>
        <ContactShadows position={[0, -1.05, 0]} opacity={0.5} scale={7} blur={2.6} far={3} />
        {/* Unutar Suspense → mounta se tek kad je model učitan (bbox postoji) */}
        <FitCamera subjectRef={bustRef} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        // Rotacija ZAKLJUČANA na vertikalnu os: polarni kut fiksan (min === max, 8° iznad
        // horizonta) → bista se vrti samo lijevo-desno, pogled se ne može okrenuti naglavačke.
        minPolarAngle={THREE.MathUtils.degToRad(82)}
        maxPolarAngle={THREE.MathUtils.degToRad(82)}
        autoRotate
        autoRotateSpeed={0.9}
        enableZoom={interactive}
        minDistance={2.2}
        maxDistance={9}
        enableDamping
      />
      <TouchAction value={interactive ? 'none' : 'pan-y'} />
    </Canvas>
  );
}

/** inline = u layoutu · native = Fullscreen API · overlay = portal fallback (iOS bez API-ja).
 *  ⚠️ Overlay MORA ići kroz createPortal u document.body: `position:fixed` unutar app
 *  stabla lomi se čim neki predak ima transform/animaciju (containing block!) — fixed se
 *  tada računa od pretka, overlay se razvuče preko cijelog scroll-sadržaja i model
 *  "potone" ispod vidljivog viewporta (viđeno na iOS Safari/PWA). */
type FsMode = 'inline' | 'native' | 'overlay';

export default function BistaViewer() {
  const [variant, setVariantState] = useState<BistaVariant>(() => variantFromUrl() ?? 'bronca');
  const setVariant = (v: BistaVariant) => {
    setVariantState(v);
    variantToUrl(v);
  };
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

  useEffect(() => {
    // Overlay: zaključaj scroll pozadine dok je otvoren.
    if (fs !== 'overlay') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fs]);

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
          /* padamo na portal overlay */
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

  const controls = (
    <>
      {/* Izbor materijala — swatchevi (prijelaz je animiran u Bust/useFrame) + naziv aktivnog */}
      <div role="group" aria-label="Materijal prikaza" style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        {VARIANT_ORDER.map((v) => (
          <button
            key={v}
            type="button"
            title={VARIANT_LABEL[v]}
            aria-label={VARIANT_LABEL[v]}
            aria-pressed={variant === v}
            onClick={() => setVariant(v)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: VARIANTS[v].color,
              cursor: 'pointer',
              border: variant === v ? '2px solid #fff' : '2px solid rgba(255,255,255,0.35)',
              boxShadow: variant === v ? '0 0 0 2px rgba(217,158,18,0.9)' : '0 1px 4px rgba(0,0,0,0.4)',
              padding: 0,
            }}
          />
        ))}
        <span aria-live="polite" style={{ marginLeft: 2, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {VARIANT_LABEL[variant]}
        </span>
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
          width: 36,
          height: 36,
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

      {/* Uputa + napomena uz donji rub (bez pointer eventa — ne smeta rotaciji) */}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 8, textAlign: 'center', pointerEvents: 'none', fontSize: 11, lineHeight: 1.35, color: 'rgba(255,255,255,0.55)' }}>
        {fs === 'inline' ? 'Povuci lijevo-desno za rotaciju · puni zaslon za zumiranje' : 'Povuci za rotaciju · kotačić ili dva prsta za zumiranje'}
        <br />
        {CAVEAT}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', background: BG }}>
      <SceneCanvas variant={variant} interactive={fs === 'native'} />
      {controls}
      {fs === 'overlay' &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: BG }}>
            <SceneCanvas variant={variant} interactive />
            {controls}
          </div>,
          document.body,
        )}
    </div>
  );
}

// Bez Draco/meshopt dekodera: GLB nije komprimiran, a drei bi inače dohvatio Draco s gstatic.com
// i kompilirao meshopt WASM — oboje blokira CSP (script-src 'self', bez wasm-unsafe-eval).
useGLTF.preload(MODEL, false, false);

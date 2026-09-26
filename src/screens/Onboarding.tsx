import { Button, Eyebrow, FeatureRow, Fingerprint, ThemeToggle } from '../components/ui';
import { navigate } from '../lib/router';

export function Onboarding({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-10 animate-riseIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint size={26} />
          <div className="flex items-center gap-1.5">
            <div className="grid h-7 w-7 place-items-center rounded-xl bg-navy p-1"><img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" /></div>
            <span className="text-sm font-bold tracking-tight text-navy">DBHZ</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-7 flex justify-center">
          <div className="grid h-28 w-28 place-items-center rounded-card bg-orange/10 p-3">
            <img src="/emblem.png" alt="Grb Družbe Braća Hrvatskoga Zmaja" className="h-full w-full object-contain" />
          </div>
        </div>
        <Eyebrow>Kulturna baština · od 1905.</Eyebrow>
        <h1 className="mt-2 text-[2.1rem] leading-[1.02]">
          Družba „Braća
          <br />
          Hrvatskoga Zmajaâ
        </h1>
        <p className="mt-3 text-sm font-semibold text-navy-mid">Pro aris et focis, Deo propitio!</p>
        <p className="mt-3 text-[0.98rem] leading-relaxed text-muted">
          Novčanik Družbe za <span className="font-semibold text-navy-ink">donacije i očuvanje baštine</span> —
          izravno, transparentno, bez posrednika.
        </p>
        <ul className="mt-6 space-y-3">
          <FeatureRow>Ulaz otiskom prsta — bez lozinki i seed-a</FeatureRow>
          <FeatureRow>Svaka donacija i ulaganje u baštinu javno vidljivi onchain</FeatureRow>
          <FeatureRow>Podrži očuvanje kulturne baštine u par sekundi</FeatureRow>
        </ul>
      </div>

      <div className="space-y-3">
        <Button full onClick={onEnter}>
          Otvori novčanik
        </Button>
        <button
          onClick={() => navigate('/dokumenti')}
          className="w-full text-center text-sm font-semibold text-navy-mid transition hover:text-orange"
        >
          Kako novčanik radi · dokumenti i dijagrami →
        </button>
        <p className="text-center text-xs leading-relaxed text-muted">
          Identitet čuva Face ID i Apple Keychain.
          <br />
          Družba „Braća Hrvatskoga Zmaja” · interaktivni prototip
        </p>
      </div>
    </div>
  );
}

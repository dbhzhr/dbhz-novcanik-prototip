import { account } from '../lib/mock';
import { Card, Chip, ScreenTitle } from '../components/ui';

/** Realističan mock QR (version-1 21×21, 3 finder ugla + gusti moduli). Deterministički iz seeda. */
function QrMock({ seed }: { seed: string }) {
  const N = 21;
  const finders: [number, number][] = [
    [0, 0],
    [0, 14],
    [14, 0],
  ];
  const inFinder = (r: number, c: number) =>
    finders.some(([r0, c0]) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7);
  const inSeparator = (r: number, c: number) =>
    finders.some(([r0, c0]) => r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7);

  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = (h ^ seed.charCodeAt(i)) * 16777619;
  const rng = () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return h / 0x7fffffff;
  };

  const cells: boolean[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) {
        const fo = finders.find(([r0, c0]) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7)!;
        const i = r - fo[0];
        const j = c - fo[1];
        const border = i === 0 || i === 6 || j === 0 || j === 6;
        const center = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        cells.push(border || center);
      } else if (inSeparator(r, c)) {
        cells.push(false);
      } else {
        cells.push(rng() > 0.5);
      }
    }
  }

  return (
    <div
      className="grid gap-[2px] rounded-2xl bg-white p-3 shadow-soft ring-1 ring-navy/5"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, width: '11.5rem', height: '11.5rem' }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? 'rounded-[1px] bg-navy' : 'bg-transparent'} />
      ))}
    </div>
  );
}

export function Primi() {
  return (
    <div className="pb-6 animate-riseIn">
      <ScreenTitle eyebrow="Primi sredstva" title="Tvoja adresa" sub="Podijeli QR ili adresu za primanje EURe — ili nadoplati SEPA uplatom." />
      <div className="space-y-4 px-4">
        <Card className="flex flex-col items-center p-6">
          <QrMock seed={account.address} />
          <p className="mt-4 font-semibold text-navy">{account.name}</p>
          <p className="mt-1 rounded-pill bg-chip px-3 py-1 text-sm tabular-nums text-muted">{account.address}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Nadoplata</p>
            <Chip>SEPA</Chip>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Uplatom s bankovnog računa EURe stiže izravno u novčanik. IBAN i poziv na broj generiraju se za svaku
            uplatu.
          </p>
        </Card>
      </div>
    </div>
  );
}

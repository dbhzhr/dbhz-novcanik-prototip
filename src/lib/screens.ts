// Čitljivi nazivi ekrana — dijeljeno između feedback widgeta i pregleda komentara.
export const SCREEN_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  home: 'Početna',
  doniraj: 'Doniraj',
  clanarina: 'Članarina',
  projekti: 'Fondovi za baštinu',
  nagrade: 'Priznanja · zmajEUR',
  glasovanje: 'Glasovanje',
  poduzetnici: 'Baština',
  primanja: 'Moj doprinos',
  aktivnost: 'Aktivnost',
  primi: 'Primi',
  bista: 'Bista · 3D',
};

export const screenLabel = (s: string) => SCREEN_LABELS[s] ?? s;

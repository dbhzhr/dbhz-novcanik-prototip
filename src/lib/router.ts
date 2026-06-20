// Minimalni klijentski router (bez biblioteke). navigate() promijeni URL i
// obavijesti App (sluša popstate). Koristi se za otvaranje /dokumenti/... iz ekrana.
export function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

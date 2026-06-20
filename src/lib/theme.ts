// Light/Dark tema. Brand tokeni (navy/orange/page/...) definirani su kao CSS
// varijable (kanali) u index.css; ovdje samo prebacujemo klasu na <html>.
export type Theme = 'light' | 'dark';

const KEY = 'dbhz_theme';

export function getTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('theme-dark')) return 'dark';
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add('theme-' + t);
  root.style.colorScheme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#081610' : '#0C5430');
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignore */
  }
}

// Tema prije paint-a (bez bljeska): light po defaultu, dark iz localStorage ili ?theme=.
// Zasebna (blokirajuća) datoteka umjesto inline skripte → CSP može biti script-src 'self'.
(function () {
  try {
    var p = new URLSearchParams(location.search).get('theme');
    var t = p === 'dark' || p === 'light' ? p : localStorage.getItem('dbhz_theme') === 'dark' ? 'dark' : 'light';
    if (p === 'dark' || p === 'light') localStorage.setItem('dbhz_theme', t);
    document.documentElement.classList.add('theme-' + t);
    document.documentElement.style.colorScheme = t;
    if (t === 'dark') {
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', '#081610');
    }
  } catch (e) {
    document.documentElement.classList.add('theme-light');
  }
})();

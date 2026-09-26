/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // DBHZ — vizualni tokeni (izvor istine: brand/BRAND.md → zmajski grb + dbhz.hr).
        // Vrijednosti su CSS varijable (kanali) definirane u src/index.css (:root = light,
        // .theme-dark = dark). Imena `navy`/`orange` zadržana radi kompatibilnosti komponenti
        // (navy = zmajska zelena, orange = heraldičko zlato).
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)', // zmajska zelena #0C5430 (header, naslovi)
          mid: 'rgb(var(--navy-mid) / <alpha-value>)',
          deep: 'rgb(var(--navy-deep) / <alpha-value>)',
          ink: 'rgb(var(--navy-ink) / <alpha-value>)', // tijelo teksta
        },
        orange: {
          DEFAULT: 'rgb(var(--orange) / <alpha-value>)', // heraldičko zlato #D99E12 (CTA, akcent)
          light: 'rgb(var(--orange-light) / <alpha-value>)',
        },
        // Tema-stabilni: hero kartice (bijeli tekst) i tekst na zlatnoj pozadini.
        hero: 'rgb(var(--hero) / <alpha-value>)',
        'on-gold': 'rgb(var(--on-gold) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        page: 'rgb(var(--page) / <alpha-value>)',
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
        chip: 'rgb(var(--chip) / <alpha-value>)',
        chipline: 'rgb(var(--chipline) / <alpha-value>)',
      },
      fontFamily: {
        // Titillium Web — font dbhz.hr (Google Fonts, SIL OFL — besplatno). Težine 300–700.
        sans: ['Titillium Web', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 30px 80px rgba(12, 84, 48, 0.14)',
        soft: '0 12px 32px rgba(12, 84, 48, 0.11)',
      },
      letterSpacing: {
        eyebrow: '0.16em',
        display: '-0.04em',
      },
      keyframes: {
        pulseDot: {
          '0%': { boxShadow: '0 0 0 0 rgba(217,158,18,0.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(217,158,18,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(217,158,18,0)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 2.2s infinite',
        riseIn: 'riseIn 0.4s ease both',
      },
    },
  },
  plugins: [],
};

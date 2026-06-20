import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { InstallPrompt } from './components/InstallPrompt';

// Rano uhvati beforeinstallprompt (Android/Chrome) — može pући prije nego React montira.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as unknown as { __bip?: Event }).__bip = e;
  window.dispatchEvent(new Event('bip-ready'));
});
window.addEventListener('appinstalled', () => {
  (window as unknown as { __bip?: Event }).__bip = undefined;
  window.dispatchEvent(new Event('bip-ready'));
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <InstallPrompt />
  </React.StrictMode>,
);

// Registriraj service worker (PWA instalabilnost + offline app-shell).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

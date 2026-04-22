// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import ContextProvider from './contex/context.jsx'

// // Suppress Chrome extension port errors
// window.addEventListener('unhandledrejection', event => {
//   const reason = event.reason;
//   const errorStr = String(reason);
//   if (errorStr.includes('message port') || errorStr.includes('Extension')) {
//     event.preventDefault();
//   }
// });

// // Also suppress runtime errors from extensions
// if (typeof chrome !== 'undefined' && chrome.runtime) {
//   chrome.runtime.onMessage?.addListener(() => {
//     return true;
//   });
// }

// createRoot(document.getElementById('root')).render(
//   <ContextProvider>
//     <App />
//   </ContextProvider>,
// )

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextProvider from './contex/context.jsx'

// ── Suppress noisy Chrome-extension errors ────────────────────────────────────
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason);
  if (
    msg.includes('message port') ||
    msg.includes('Extension') ||
    msg.includes('chrome-extension') ||
    msg.includes('runtime.lastError')
  ) {
    event.preventDefault();
  }
});

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(() => true);
}

// ── Global error boundary for uncaught sync errors ───────────────────────────
window.addEventListener('error', (event) => {
  const msg = String(event?.message ?? '');
  if (msg.includes('Extension') || msg.includes('chrome-extension')) {
    event.preventDefault();
  }
});

// ── Mount ─────────────────────────────────────────────────────────────────────
const container = document.getElementById('root');

if (!container) {
  throw new Error(
    '[main.jsx] Root element #root not found. Check your index.html.'
  );
}

createRoot(container).render(
  <StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </StrictMode>
);
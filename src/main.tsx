import React from 'react';
import ReactDOM from 'react-dom/client';
import '../global.css';

function App() {
  return (
    <div id="thumbcode-app">
      <h1>ThumbCode</h1>
      <p>Migration in progress — Vite + React build foundation.</p>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html has a <div id="root"></div>.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

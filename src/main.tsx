import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope';
import '@fontsource-variable/syne';
import App from './App';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root application mount point');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

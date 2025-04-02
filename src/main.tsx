import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SchedulingProvider } from './lib/scheduling/scheduling-context';
import './lib/firebase'; // Initialisation de Firebase

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SchedulingProvider>
      <App />
    </SchedulingProvider>
  </StrictMode>
);
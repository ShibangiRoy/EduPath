import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthAndSyncProvider } from './context/AuthAndSyncContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthAndSyncProvider>
      <App />
    </AuthAndSyncProvider>
  </StrictMode>,
);

/**
 * Application Entry Point
 *
 * Mounts the React app with BrowserRouter and all required providers.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error';
import { ToastContainer } from '@/components/feedback/ToastContainer';
import { OnboardingProvider } from '@/contexts/onboarding';
import { AppRoutes } from '@/router';
import '../global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Ensure index.html has a <div id="root"></div>.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <OnboardingProvider>
          <AppRoutes />
          <ToastContainer />
        </OnboardingProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

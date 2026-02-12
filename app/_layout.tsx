/**
 * Root Layout
 *
 * Entry point that composes AppProviders and RootLayoutNav
 * extracted into src/components/layout/.
 */

import { certificatePinningService, runtimeSecurityService } from '@thumbcode/core';
import { useEffect } from 'react';
import { AppProviders } from '@/components/layout/AppProviders';
import { RootLayoutNav } from '@/components/layout/RootLayoutNav';
import { logger, setupGlobalErrorHandlers } from '@/lib';
import '../global.css';

// Initialize global error handlers
setupGlobalErrorHandlers();
logger.info('ThumbCode app started');

export default function RootLayout() {
  useEffect(() => {
    certificatePinningService.initialize();
    runtimeSecurityService.checkAndHandleRootedStatus();
  }, []);

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

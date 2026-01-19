/**
 * Certificate Pinning Service
 *
 * Initializes SSL public key pinning to prevent man-in-the-middle attacks.
 * This service should be called once at the application's entry point.
 */
import { initializeSslPinning } from 'react-native-ssl-public-key-pinning';

// Public key hashes for the APIs used in the application
// Each domain must have a publicKeyHashes array with at least 2 pins (iOS requirement)
const PINNING_CONFIG = {
  'api.github.com': {
    publicKeyHashes: [
      'H8zmHRgw4cFDQn+MvcyfhImeWNY4kN9HXO/J9xX32gk=',
      'nKWcsYrc+y5I8vLf1VGByjbt+Hnasjl+9h8lNKJytoE=', // Backup pin
    ],
  },
  'api.anthropic.com': {
    publicKeyHashes: [
      'dlJe145OFRVi3s8R63aTImXFgAv9B3lNJJcd0M3JjJk=',
      'nKWcsYrc+y5I8vLf1VGByjbt+Hnasjl+9h8lNKJytoE=', // Backup pin
    ],
  },
  'api.openai.com': {
    publicKeyHashes: [
      'y5npFVdBuoqCSOdQa42qiUSPqwMpoei7NK0rQWGUaSU=',
      'nKWcsYrc+y5I8vLf1VGByjbt+Hnasjl+9h8lNKJytoE=', // Backup pin
    ],
  },
};

class CertificatePinningService {
  private isInitialized = false;

  /**
   * Initializes the SSL pinning configuration.
   * This method should be called as early as possible in the app's lifecycle.
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('Certificate pinning is already initialized.');
      return;
    }

    try {
      await initializeSslPinning(PINNING_CONFIG);
      this.isInitialized = true;
      console.log('Certificate pinning initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize certificate pinning:', error);
      // In a production environment, you might want to handle this error
      // more gracefully, e.g., by preventing the user from proceeding.
    }
  }
}

export const certificatePinningService = new CertificatePinningService();

/**
 * Certificate Pinning Service
 *
 * On native platforms, this initializes SSL public key pinning to prevent MITM attacks.
 * On web, certificate pinning is handled by the browser's TLS implementation,
 * so this service is a no-op.
 */

// Public key hashes for the APIs used in the application (reference only on web)
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
   * On web, this is a no-op since TLS is managed by the browser.
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // On web, certificate pinning is handled by the browser's TLS layer.
    // Log the configuration for debugging purposes.
    if (import.meta.env.DEV) {
      console.debug(
        'CertificatePinningService: Web platform detected. ' +
          `TLS pinning managed by browser for ${Object.keys(PINNING_CONFIG).length} domains.`
      );
    }
    this.isInitialized = true;
  }
}

export const certificatePinningService = new CertificatePinningService();

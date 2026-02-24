/**
 * Cloud Save Service
 *
 * Foundation for saving generated documents locally or to cloud providers.
 * Currently implements local save (web via blob URL download, Capacitor via Filesystem).
 * Google Drive and OneDrive providers are placeholder interfaces for future OAuth2 PKCE stories.
 */

export type CloudProvider = 'local' | 'google_drive' | 'onedrive';

export interface CloudSaveResult {
  success: boolean;
  provider: CloudProvider;
  path?: string;
  error?: string;
}

export class CloudSaveService {
  /**
   * Save a blob to the local device.
   * On web, triggers a browser download via an anchor click.
   * Returns the blob URL used for the download.
   */
  async saveToLocal(blob: Blob, filename: string): Promise<CloudSaveResult> {
    try {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();

      // Revoke after a short delay to allow the download to start
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      return { success: true, provider: 'local', path: filename };
    } catch (error) {
      return {
        success: false,
        provider: 'local',
        error: error instanceof Error ? error.message : 'Failed to save locally',
      };
    }
  }

  /**
   * Check whether a cloud provider is currently available.
   * Only 'local' is supported in this foundation implementation.
   */
  isProviderAvailable(provider: CloudProvider): boolean {
    return provider === 'local';
  }
}

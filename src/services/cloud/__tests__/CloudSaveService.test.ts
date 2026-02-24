/**
 * CloudSaveService Tests
 *
 * Verifies local save behavior and provider availability checks.
 */

import { CloudSaveService } from '../CloudSaveService';

describe('CloudSaveService', () => {
  let service: CloudSaveService;

  beforeEach(() => {
    service = new CloudSaveService();
  });

  describe('isProviderAvailable', () => {
    it('should return true for local provider', () => {
      expect(service.isProviderAvailable('local')).toBe(true);
    });

    it('should return false for google_drive', () => {
      expect(service.isProviderAvailable('google_drive')).toBe(false);
    });

    it('should return false for onedrive', () => {
      expect(service.isProviderAvailable('onedrive')).toBe(false);
    });
  });

  describe('saveToLocal', () => {
    it('should create a blob URL and trigger download', async () => {
      const clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        if (tag === 'a') {
          return { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });

      const mockUrl = 'blob:http://localhost/test-blob';
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

      const blob = new Blob(['test data'], { type: 'text/plain' });
      const result = await service.saveToLocal(blob, 'test.txt');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('local');
      expect(result.path).toBe('test.txt');
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);

      vi.restoreAllMocks();
    });

    it('should return error on failure', async () => {
      vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
        throw new Error('Blob URL creation failed');
      });

      const blob = new Blob(['test']);
      const result = await service.saveToLocal(blob, 'test.txt');

      expect(result.success).toBe(false);
      expect(result.provider).toBe('local');
      expect(result.error).toContain('Blob URL creation failed');

      vi.restoreAllMocks();
    });
  });
});
